class LoginPage:
    def __init__(self, page):
        self.page = page

        self.username = "[data-unid='login__username__input']"
        self.password = "[data-unid='login__password__input']"
        self.submit = "[data-unid='login__submit__button']"

    def open(self):
        self.page.goto("http://localhost:8000/login.html")

    def login(self, username, password):
        self.page.fill(self.username, username)
        self.page.fill(self.password, password)
        self.page.click(self.submit)
