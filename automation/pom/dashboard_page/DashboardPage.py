from pom.dashboard_page.dashboard_page import dashboard_page

class DashboardPage:
    def __init__(self, page):
        self.page = page
    
    def click_create_project(self):
        self.page.click(dashboard_page['create_project_button'])