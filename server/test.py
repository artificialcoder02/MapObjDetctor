import sys
from PySide6.QtWidgets import QApplication, QWidget, QLabel, QLineEdit, QPushButton, QVBoxLayout
import webbrowser

class WebPageOpener(QWidget):
    def __init__(self):
        super().__init__()

        self.init_ui()

    def init_ui(self):
        self.setWindowTitle('Web Page Opener')
        self.setGeometry(300, 300, 400, 200)

        self.label = QLabel('Enter URL:', self)
        self.url_entry = QLineEdit(self)

        self.open_button = QPushButton('Open URL', self)
        self.open_button.clicked.connect(self.open_url)

        layout = QVBoxLayout()
        layout.addWidget(self.label)
        layout.addWidget(self.url_entry)
        layout.addWidget(self.open_button)

        self.setLayout(layout)

    def open_url(self):
        url = self.url_entry.text()
        webbrowser.open(url)

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = WebPageOpener()
    window.show()
    sys.exit(app.exec_())