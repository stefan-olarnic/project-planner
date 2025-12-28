"""
Tasks Page Object Model
"""
from automation.pom.tasks_page.tasks_page import (
    tasks_page,
    add_task_modal,
    task_item
)


class TasksPage:
    def __init__(self, page):
        self.page = page
    
    def is_loaded(self):
        """Check if tasks page is loaded"""
        return self.page.locator(tasks_page['add_task_btn']).is_visible()
    
    def verify_project_page_displayed(self, project_name):
        """Verify project page is displayed with correct title"""
        project_title = self.page.locator(tasks_page['project_title'])
        project_title.wait_for(state='visible', timeout=5000)
        actual_title = project_title.inner_text()
        assert actual_title == project_name, \
            f"Expected project '{project_name}', got '{actual_title}'"
    
    def click_add_task_button(self):
        """Click the Add Task button"""
        self.page.click(tasks_page['add_task_btn'])
        self.page.wait_for_timeout(500)
    
    def create_task(self, title, description=None, due_date=None):
        """Create a new task"""
        # Click add task button if modal not visible
        if not self.is_add_task_modal_visible():
            self.click_add_task_button()
        
        # Fill task title
        self.page.fill(add_task_modal['title_input'], title)
        
        # Fill description/note if provided
        if description:
            self.page.fill(add_task_modal['note_input'], description)
        
        # Fill due date if provided
        if due_date:
            self.page.fill(add_task_modal['due_date_input'], due_date)
        
        # Save task
        self.page.click(add_task_modal['save_btn'])
        self.page.wait_for_timeout(500)
    
    def is_add_task_modal_visible(self):
        """Check if add task modal is visible"""
        modal = self.page.locator(add_task_modal['modal'])
        if modal.count() > 0:
            aria_hidden = modal.get_attribute('aria-hidden')
            return aria_hidden == 'false'
        return False
    
    def verify_task_in_list(self, task_title):
        """Verify task is listed in tasks list"""
        tasks_list = self.page.locator(tasks_page['tasks_list'])
        task_items = tasks_list.locator(task_item['task_row'])
        
        found = False
        for i in range(task_items.count()):
            task = task_items.nth(i)
            # Task title is either in <strong> or in label text
            text_content = task.inner_text()
            if task_title in text_content:
                found = True
                break
        
        assert found, f"Task '{task_title}' not found in tasks list. Found tasks: {[task_items.nth(i).inner_text() for i in range(task_items.count())]}"
    
    def get_tasks_count(self):
        """Get number of tasks in project"""
        tasks_count_elem = self.page.locator(tasks_page['tasks_count'])
        count_text = tasks_count_elem.inner_text()
        return int(count_text)
    
    def mark_task_as_done(self, task_title):
        """Mark a task as done"""
        tasks_list = self.page.locator(tasks_page['tasks_list'])
        task_items = tasks_list.locator(task_item['task_row'])
        
        for i in range(task_items.count()):
            task = task_items.nth(i)
            text_content = task.inner_text()
            if task_title in text_content:
                checkbox = task.locator(task_item['task_checkbox'])
                checkbox.click()
                self.page.wait_for_timeout(500)
                return True
        
        return False
    
    def is_task_marked_as_done(self, task_title):
        """Check if task is marked as done"""
        tasks_list = self.page.locator(tasks_page['tasks_list'])
        task_items = tasks_list.locator(task_item['task_row'])
        
        for i in range(task_items.count()):
            task = task_items.nth(i)
            text_content = task.inner_text()
            if task_title in text_content:
                checkbox = task.locator(task_item['task_checkbox'])
                return checkbox.is_checked()
        
        return False
    
    def delete_task_at_position(self, position):
        """Delete task at specific position (1-indexed)"""
        tasks_list = self.page.locator(tasks_page['tasks_list'])
        task_items = tasks_list.locator(task_item['task_row'])
        
        if position <= task_items.count():
            task = task_items.nth(position - 1)
            delete_btn = task.locator(task_item['delete_btn'])
            delete_btn.click()
            self.page.wait_for_timeout(500)
            return True
        
        return False
    
    def get_project_progress(self):
        """Get project progress percentage"""
        progress_elem = self.page.locator(tasks_page['progress_text'])
        return progress_elem.inner_text()
    
    def mark_n_tasks_as_done(self, count):
        """Mark N tasks as done"""
        tasks_list = self.page.locator(tasks_page['tasks_list'])
        task_items = tasks_list.locator(task_item['task_row'])
        
        marked = 0
        for i in range(min(count, task_items.count())):
            task = task_items.nth(i)
            checkbox = task.locator(task_item['task_checkbox'])
            if not checkbox.is_checked():
                checkbox.click()
                self.page.wait_for_timeout(300)
                marked += 1
        
        return marked
    
    def mark_all_tasks_as_done(self):
        """Mark all tasks as done"""
        tasks_list = self.page.locator(tasks_page['tasks_list'])
        task_items = tasks_list.locator(task_item['task_row'])
        total_count = task_items.count()
        
        return self.mark_n_tasks_as_done(total_count)
    
    def get_add_task_error(self):
        """Get error message from add task modal"""
        error_elem = self.page.locator(add_task_modal['error_msg'])
        return error_elem.inner_text()
    
    def delete_task_by_name(self, task_title):
        """Delete a task by its name"""
        tasks_list = self.page.locator(tasks_page['tasks_list'])
        task_items = tasks_list.locator(task_item['task_row'])
        
        for i in range(task_items.count()):
            task = task_items.nth(i)
            text_content = task.inner_text()
            if task_title in text_content:
                delete_btn = task.locator(task_item['delete_btn'])
                delete_btn.click()
                self.page.wait_for_timeout(500)
                return True
        
        return False
    
    def is_task_present(self, task_title):
        """Check if a task is present in the list"""
        tasks_list = self.page.locator(tasks_page['tasks_list'])
        task_items = tasks_list.locator(task_item['task_row'])
        
        for i in range(task_items.count()):
            task = task_items.nth(i)
            text_content = task.inner_text()
            if task_title in text_content:
                return True
        
        return False
