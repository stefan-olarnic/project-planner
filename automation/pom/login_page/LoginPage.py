from pom.login_page.login_page import login_page

class LoginPage:
    def __init__(self, page):
        self.page = page

    def open_app(self):
        self.page.goto("http://localhost:8000/project-planner/login.html")

    def login(self, username, password):
        self.page.fill(login_page['username_input'], username)
        self.page.fill(login_page['password_input'], password)  
        self.page.click(login_page['submit_button'])