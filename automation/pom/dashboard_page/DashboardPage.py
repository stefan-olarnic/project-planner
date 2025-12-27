from pom.dashboard_page.dashboard_page import dashboard_page

class DashboardPage:
    def __init__(self, page):
        self.page = page
    
    def click_create_project(self):
        self.page.click(dashboard_page['create_project_button'])
    
    def verify_user_has_free_plan(self):
        """Verifies that the current-plan-badge is in the free-plan-card and not in pro-plan-card"""
        free_card = self.page.locator(dashboard_page['free_plan_card'])
        pro_card = self.page.locator(dashboard_page['pro_plan_card'])
        
        # Verify badge exists in free-plan-card
        badge_in_free = free_card.locator(dashboard_page['current_plan_badge'])
        assert badge_in_free.is_visible(), "Current plan badge not found in FREE plan card"
        
        # Verify badge does NOT exist in pro-plan-card
        badge_in_pro = pro_card.locator(dashboard_page['current_plan_badge'])
        assert badge_in_pro.count() == 0, "Current plan badge should NOT be in PRO plan card"
        
        print("✓ User has FREE plan - badge is correctly displayed in free-plan-card")

    def verify_user_has_pro_plan(self):
        """Verifies that the current-plan-badge is in the pro-plan-card and not in free-plan-card"""
        free_card = self.page.locator(dashboard_page['free_plan_card'])
        pro_card = self.page.locator(dashboard_page['pro_plan_card'])
        
        # Verify badge exists in pro-plan-card
        badge_in_pro = pro_card.locator(dashboard_page['current_plan_badge'])
        assert badge_in_pro.is_visible(), "Current plan badge not found in PRO plan card"
        
        # Verify badge does NOT exist in free-plan-card
        badge_in_free = free_card.locator(dashboard_page['current_plan_badge'])
        assert badge_in_free.count() == 0, "Current plan badge should NOT be in FREE plan card"
        
        print("✓ User has PRO plan - badge is correctly displayed in pro-plan-card")    