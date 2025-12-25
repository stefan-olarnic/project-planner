from automation.pom.base_page.BasePage import BasePage

class ProjectsPage(BasePage):
    def __init__(self, page):
        super().__init__(page, expected_url_fragment="projects.html")
        self.page = page