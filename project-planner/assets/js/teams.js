// teams.js
// Team management: create teams, invite members, manage roles and permissions

(function() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) return; // Only run if user is logged in

    // Extract username
    let username = '';
    try {
        const p = JSON.parse(loggedInUser);
        username = p.username || p.user || p.name || String(p);
    } catch (e) {
        username = String(loggedInUser);
    }
    username = String(username).trim() || 'user';

    // Roles and their permissions
    const ROLES = {
        'owner': {
            name: 'Owner',
            permissions: ['view', 'create', 'edit', 'delete', 'invite', 'manage_roles']
        },
        'admin': {
            name: 'Admin',
            permissions: ['view', 'create', 'edit', 'delete', 'invite']
        },
        'member': {
            name: 'Member',
            permissions: ['view', 'create', 'edit']
        },
        'viewer': {
            name: 'Viewer',
            permissions: ['view']
        }
    };

    // Storage keys - teams are global (shared across users), invitations are global
    const teamsKey = `teams_global`; // Global teams storage
    const teamInvitationsKey = `team_invitations_global`; // Global invitations (by email/username)

    // Load/Save functions
    function loadTeams() {
        try {
            // First, try to load from global storage
            let raw = localStorage.getItem(teamsKey);
            if (raw) {
                return JSON.parse(raw);
            }
            
            // Migration: If no global teams, check for user-specific teams and migrate them
            const oldTeamsKey = `teams_${username}`;
            const oldRaw = localStorage.getItem(oldTeamsKey);
            if (oldRaw) {
                try {
                    const oldTeams = JSON.parse(oldRaw);
                    // Migrate to global storage
                    localStorage.setItem(teamsKey, oldRaw);
                    // Optionally remove old storage (commented out to be safe)
                    // localStorage.removeItem(oldTeamsKey);
                    return oldTeams;
                } catch (e) {
                    // Ignore migration errors
                }
            }
            
            return [];
        } catch (e) {
            return [];
        }
    }

    function saveTeams(teams) {
        localStorage.setItem(teamsKey, JSON.stringify(teams));
    }

    function loadInvitations() {
        try {
            const raw = localStorage.getItem(teamInvitationsKey);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveInvitations(invitations) {
        localStorage.setItem(teamInvitationsKey, JSON.stringify(invitations));
    }

    // Get current user's teams
    function getUserTeams() {
        const allTeams = loadTeams();
        return allTeams.filter(team => 
            team.members && team.members.some(m => m.username === username)
        );
    }

    // Get user's role in a team
    function getUserRoleInTeam(teamId) {
        const teams = loadTeams();
        const team = teams.find(t => t.id === teamId);
        if (!team || !team.members) return null;
        const member = team.members.find(m => m.username === username);
        return member ? member.role : null;
    }

    // Check if user has permission in a team
    function hasPermission(teamId, permission) {
        const role = getUserRoleInTeam(teamId);
        if (!role || !ROLES[role]) return false;
        return ROLES[role].permissions.includes(permission);
    }

    // Create a new team
    function createTeam(teamName, description = '') {
        const teams = loadTeams();
        const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newTeam = {
            id: teamId,
            name: teamName,
            description: description,
            createdAt: new Date().toISOString(),
            members: [{
                username: username,
                role: 'owner',
                joinedAt: new Date().toISOString()
            }]
        };
        teams.push(newTeam);
        saveTeams(teams);
        return newTeam;
    }

    // Invite a user to a team
    function inviteUserToTeam(teamId, inviteUsername, role = 'member') {
        if (!ROLES[role]) return { success: false, error: 'Invalid role' };
        
        const teams = loadTeams();
        const team = teams.find(t => t.id === teamId);
        if (!team) return { success: false, error: 'Team not found' };

        // Check if user has permission to invite
        if (!hasPermission(teamId, 'invite')) {
            return { success: false, error: 'You do not have permission to invite members' };
        }

        // Check if user is already a member
        if (team.members.some(m => m.username === inviteUsername)) {
            return { success: false, error: 'User is already a member' };
        }

        // Add invitation
        const invitations = loadInvitations();
        const invitationId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        invitations.push({
            id: invitationId,
            teamId: teamId,
            teamName: team.name,
            invitedBy: username,
            inviteUsername: inviteUsername,
            role: role,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        saveInvitations(invitations);

        // If the invited user is currently logged in (for demo purposes), auto-add them
        // In a real app, this would be handled via email/notification
        const currentInvitations = loadInvitations();
        const pendingInvites = currentInvitations.filter(
            inv => inv.inviteUsername === inviteUsername && inv.status === 'pending'
        );
        
        return { success: true, invitations: pendingInvites };
    }

    // Accept an invitation
    function acceptInvitation(invitationId) {
        const invitations = loadInvitations();
        const invitation = invitations.find(inv => inv.id === invitationId);
        if (!invitation || invitation.status !== 'pending') {
            return { success: false, error: 'Invitation not found or already processed' };
        }

        const teams = loadTeams();
        const team = teams.find(t => t.id === invitation.teamId);
        if (!team) {
            return { success: false, error: 'Team not found. The team may have been deleted.' };
        }

        // Check if user is already a member
        if (team.members && team.members.some(m => m.username === username)) {
            // User is already a member, just mark invitation as accepted
            invitation.status = 'accepted';
            invitation.acceptedAt = new Date().toISOString();
            saveInvitations(invitations);
            return { success: true, message: 'You are already a member of this team.' };
        }

        // Add current user to team (use current username, not the one from invitation)
        if (!team.members) {
            team.members = [];
        }
        team.members.push({
            username: username, // Use current logged-in username
            role: invitation.role,
            joinedAt: new Date().toISOString()
        });

        // Mark invitation as accepted
        invitation.status = 'accepted';
        invitation.acceptedAt = new Date().toISOString();

        saveTeams(teams);
        saveInvitations(invitations);
        return { success: true };
    }

    // Remove a member from a team
    function removeMember(teamId, memberUsername) {
        const teams = loadTeams();
        const team = teams.find(t => t.id === teamId);
        if (!team) return { success: false, error: 'Team not found' };

        // Check permissions
        if (!hasPermission(teamId, 'manage_roles') && username !== memberUsername) {
            return { success: false, error: 'You do not have permission to remove members' };
        }

        // Don't allow removing the owner
        const member = team.members.find(m => m.username === memberUsername);
        if (member && member.role === 'owner') {
            return { success: false, error: 'Cannot remove team owner' };
        }

        team.members = team.members.filter(m => m.username !== memberUsername);
        saveTeams(teams);
        return { success: true };
    }

    // Update member role
    function updateMemberRole(teamId, memberUsername, newRole) {
        if (!ROLES[newRole]) return { success: false, error: 'Invalid role' };
        
        const teams = loadTeams();
        const team = teams.find(t => t.id === teamId);
        if (!team) return { success: false, error: 'Team not found' };

        // Check permissions
        if (!hasPermission(teamId, 'manage_roles')) {
            return { success: false, error: 'You do not have permission to change roles' };
        }

        const member = team.members.find(m => m.username === memberUsername);
        if (!member) return { success: false, error: 'Member not found' };

        // Don't allow changing owner role
        if (member.role === 'owner') {
            return { success: false, error: 'Cannot change owner role' };
        }

        member.role = newRole;
        saveTeams(teams);
        return { success: true };
    }

    // Get pending invitations for current user
    function getPendingInvitations() {
        const invitations = loadInvitations();
        // Get user's email from localStorage if available
        let userEmail = '';
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const currentUser = users.find(u => u.username === username);
            if (currentUser && currentUser.email) {
                userEmail = currentUser.email.toLowerCase();
            }
        } catch (e) {
            // Ignore errors
        }
        
        const usernameLower = username.toLowerCase();
        
        // Match by username or email
        return invitations.filter(
            inv => {
                if (inv.status !== 'pending') return false;
                
                const inviteValue = (inv.inviteUsername || '').toLowerCase();
                
                // Check if invitation matches current username
                const matchesUsername = inviteValue === usernameLower;
                
                // Check if invitation matches user's email
                const matchesEmail = userEmail && inviteValue === userEmail;
                
                // Also check if invitation was sent to email and user logged in with that email
                // (in case user registered with email as username)
                const inviteIsEmail = inviteValue.includes('@');
                const userLoggedInWithEmail = usernameLower.includes('@');
                const emailMatch = inviteIsEmail && userLoggedInWithEmail && inviteValue === usernameLower;
                
                return matchesUsername || matchesEmail || emailMatch;
            }
        );
    }

    // Decline an invitation
    function declineInvitation(invitationId) {
        const invitations = loadInvitations();
        const invitation = invitations.find(inv => inv.id === invitationId);
        if (!invitation || invitation.status !== 'pending') {
            return { success: false, error: 'Invitation not found or already processed' };
        }

        invitation.status = 'declined';
        invitation.declinedAt = new Date().toISOString();
        saveInvitations(invitations);
        return { success: true };
    }

    // Leave a team (remove current user from team)
    function leaveTeam(teamId) {
        const teams = loadTeams();
        const team = teams.find(t => t.id === teamId);
        if (!team) return { success: false, error: 'Team not found' };

        // Check if user is a member
        const memberIndex = team.members.findIndex(m => m.username === username);
        if (memberIndex === -1) {
            return { success: false, error: 'You are not a member of this team' };
        }

        // Don't allow owner to leave (they must delete the team instead)
        const member = team.members[memberIndex];
        if (member.role === 'owner') {
            return { success: false, error: 'Team owner cannot leave. Please delete the team instead.' };
        }

        // Remove user from team
        team.members.splice(memberIndex, 1);
        saveTeams(teams);
        return { success: true };
    }

    // Delete a team (only owner can do this)
    function deleteTeam(teamId) {
        const teams = loadTeams();
        const team = teams.find(t => t.id === teamId);
        if (!team) return { success: false, error: 'Team not found' };

        // Check if user is the owner
        const member = team.members.find(m => m.username === username);
        if (!member || member.role !== 'owner') {
            return { success: false, error: 'Only the team owner can delete the team' };
        }

        // Remove team from teams array
        const teamIndex = teams.findIndex(t => t.id === teamId);
        if (teamIndex !== -1) {
            teams.splice(teamIndex, 1);
            saveTeams(teams);
        }

        // Also remove any pending invitations for this team
        const invitations = loadInvitations();
        const filteredInvitations = invitations.filter(inv => inv.teamId !== teamId);
        saveInvitations(filteredInvitations);

        return { success: true };
    }

    // Check if user can perform action on a project (based on team membership)
    function canPerformAction(projectIndex, action) {
        // For now, projects are user-specific. In a full implementation,
        // projects would be linked to teams
        // This is a placeholder for future team-project integration
        return true; // Default: allow (maintains backward compatibility)
    }

    // Export functions to window for use in other scripts
    window.TeamsManager = {
        ROLES,
        loadTeams,
        saveTeams,
        getUserTeams,
        getUserRoleInTeam,
        hasPermission,
        createTeam,
        inviteUserToTeam,
        acceptInvitation,
        declineInvitation,
        removeMember,
        updateMemberRole,
        leaveTeam,
        deleteTeam,
        getPendingInvitations,
        canPerformAction,
        loadInvitations,
        saveInvitations
    };
})();

