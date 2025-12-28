from automation.pom.base_page.BasePage import BasePage
from automation.pom.projects_page.projects_page import (
    projects_page,
    create_project_dialog,
    limit_reached_dialog
)

class ProjectsPage(BasePage):
    def __init__(self, page):
        super().__init__(page, expected_url_fragment="projects.html")
        self.page = page

    def create_project(
            self,
            project_name,
            description="This is a test project.",
            status="Active"
    ):
        """
        Create a new project with the given name
        
        Args:
            project_name: Name of the project to create
            description: Project description
            status: Project status (Planned/Active/Completed)
        """
        # Create the project
        self.page.click(projects_page['create_project_button'])
        self.page.fill(create_project_dialog['project_name_input'], project_name)
        self.page.fill(create_project_dialog['project_description_input'], description)
        self.page.select_option(create_project_dialog['status_dropdown'], status)
        self.page.click(create_project_dialog['submit_button'])
        
        # Wait for modal to close (state="hidden" or "detached")
        self.page.wait_for_selector("#create-project-modal", state="hidden", timeout=5000)
    
    def try_create_project_at_limit(self):
        """
        Try to create a project when at limit (button is disabled)
        Forces click to trigger the limit modal
        """
        try:
            # Force click on disabled button to trigger limit modal
            self.page.click(
                projects_page['create_project_button'],
                force=True,
                timeout=3000
            )
        except Exception as e:
            # Modal might already be visible or button behavior changed
            print(f"Note: Could not click button - {e}")

    def verify_project_exists(self, project_name, expected_status=None):
        """
        Verify that a project with the given name exists in the NAME column specifically
        
        Args:
            project_name: Name of the project to verify
            expected_status: Optional - if provided, also verify the project status
            
        Raises:
            AssertionError: If project is not found or status doesn't match
        """
        # Folosește get_all_project_names() pentru a verifica existența
        all_projects = self.get_all_project_names()
        
        assert project_name in all_projects, \
            f"Project '{project_name}' not found in projects table. " \
            f"Available projects: {all_projects}"
        
        # Verifică și vizibilitatea link-ului
        project_link = self.page.locator(f"a.project-link:has-text('{project_name}')")
        assert project_link.is_visible(), \
            f"Project '{project_name}' exists but is not visible"
        
        # Dacă se cere, verifică și statusul
        if expected_status:
            actual_status = self.get_project_status(project_name)
            assert actual_status == expected_status, \
                f"Project '{project_name}' has status '{actual_status}', expected '{expected_status}'"
            print(f"✓ Project '{project_name}' exists with status '{actual_status}'")
        
    def get_project_status(self, project_name):
        """
        Get the status of a project by its name
        
        Args:
            project_name: Name of the project
            
        Returns:
            str: The status of the project (e.g., 'Active', 'Planned', 'Completed')
        """
        # Găsește rândul care conține link-ul cu numele proiectului
        row = self.page.locator(f"tr:has(a.project-link:text-is('{project_name}'))")
        
        if row.count() == 0:
            raise ValueError(f"Project '{project_name}' not found in table")
        
        # Coloana 3 = Status (conține span cu clasa status-badge)
        status = row.locator("td:nth-child(3) .status-badge").inner_text()
        return status.strip()

    def get_all_project_names(self):
        """
        Get a list of all project names from the Name column
        
        Returns:
            list: List of project names
        """
        # Găsește toate link-urile cu clasa project-link din tbody
        project_links = self.page.locator("tbody a.project-link")
        project_names = []
    
        count = project_links.count()
        for i in range(count):
            name = project_links.nth(i).inner_text()
            project_names.append(name.strip())
    
        return project_names
    
    def get_project_count(self):
        """
        Get the number of projects in the table
        
        Returns:
            int: Number of projects
        """
        return len(self.get_all_project_names())
    
    def verify_limit_modal_displayed(self):
        """
        Verify that the plan limit modal is displayed
        
        Returns:
            bool: True if modal is visible
        """
        limit_modal = self.page.locator("#limit-modal[aria-hidden='false']")
        assert limit_modal.is_visible(), "Plan limit modal is not displayed"
        return True
    
    def get_limit_modal_message(self):
        """
        Get the message text from the limit modal
        
        Returns:
            str: Modal message text
        """
        message = self.page.locator("#limit-modal-msg").inner_text()
        return message.strip()
    
    def verify_upgrade_button_visible(self):
        """
        Verify that the Upgrade button is visible in the limit modal
        """
        upgrade_btn = self.page.locator(limit_reached_dialog['upgrade_button'])
        assert upgrade_btn.is_visible(), "Upgrade button is not visible"
        return True
    
    def is_create_button_enabled(self):
        """
        Check if the Create Project button is enabled
        
        Returns:
            bool: True if enabled, False if disabled
        """
        create_btn = self.page.locator(projects_page['create_project_button'])
        # Check if button has disabled attribute or aria-disabled
        is_disabled = create_btn.get_attribute('disabled') is not None or \
                     create_btn.get_attribute('aria-disabled') == 'true'
        return not is_disabled
    
    def open_project(self, project_name):
        """
        Open a project by clicking its name link
        
        Args:
            project_name: Name of the project to open
        """
        project_link = self.page.locator(f"a.project-link:has-text('{project_name}')")
        assert project_link.is_visible(), f"Project '{project_name}' link not found"
        project_link.click()
        
        # Wait for navigation to project page
        self.page.wait_for_url("**/project.html*", timeout=5000)
        self.page.wait_for_timeout(500)
    
    def project_exists(self, project_name):
        """
        Check if a project exists in the projects list
        
        Args:
            project_name: Name of the project to check
            
        Returns:
            bool: True if project exists, False otherwise
        """
        all_projects = self.get_all_project_names()
        return project_name in all_projects
    
    def navigate_to_project(self, project_name):
        """
        Navigate to a project - create it if it doesn't exist, then open it
        
        Args:
            project_name: Name of the project to navigate to
        """
        if not self.project_exists(project_name):
            print(f"Project '{project_name}' not found. Creating it...")
            self.create_project(project_name)
        
        print(f"Opening project '{project_name}'...")
        self.open_project(project_name)
    