"""
Locators for Tasks Page
"""

# Main tasks page elements
tasks_page = {
    'add_task_btn': "[data-unid='project__add_task_btn']",
    'tasks_list': "[data-unid='project__tasks_list']",
    'tasks_count': "[data-unid='project__tasks_count']",
    'today_tasks_list': "[data-unid='project__today_tasks_list']",
    'project_title': "[data-unid='project__title']",
    'project_description': "[data-unid='project__description']",
    'edit_project_btn': "[data-unid='project__edit_project_btn']",
    'delete_project_btn': "[data-unid='project__delete_project_btn']",
    'progress_bar': "#project-progress .progress-inner",
    'progress_text': "#project-progress .progress-text"
}

# Add task modal
add_task_modal = {
    'modal': "#add-task-modal",
    'title_input': "[data-unid='project__add_task_title_input']",
    'note_input': "[data-unid='project__add_task_note_input']",
    'due_date_input': "[data-unid='project__add_task_due_input']",
    'error_msg': "[data-unid='project__add_task_error']",
    'cancel_btn': "[data-unid='project__add_task_cancel']",
    'save_btn': "[data-unid='project__add_task_save']"
}

# Task item elements (dynamically generated in <li> elements)
task_item = {
    'task_row': "li",  # tasks are simple <li> elements
    'task_checkbox': ".task-done-checkbox",  # checkbox with this class
    'task_title': "strong",  # title is in <strong> tag
    'task_note': ".text-sm.text-gray-600",  # note/description
    'task_due_date': ".text-sm.text-gray-500",  # due date text
    'delete_btn': "button[data-action='delete']",
    'set_today_btn': "button[data-action='set-today']",
    'set_date_btn': "button[data-action='set-date']"
}

# Edit project modal
edit_project_modal = {
    'modal': "#edit-project-modal",
    'name_input': "#project-edit-name",
    'description_input': "#project-edit-desc",
    'status_dropdown': "#project-edit-status",
    'error_msg': "#project-edit-error",
    'cancel_btn': "#project-edit-cancel",
    'save_btn': "#project-edit-save"
}

# Delete project modal
delete_project_modal = {
    'modal': "#delete-project-modal",
    'message': "#delete-project-msg",
    'cancel_btn': "#delete-project-cancel",
    'confirm_btn': "#delete-project-confirm"
}

# Set date modal
set_date_modal = {
    'modal': "#set-date-modal",
    'date_input': "#set-date-input",
    'error_msg': "#set-date-error",
    'cancel_btn': "#set-date-cancel",
    'save_btn': "#set-date-save"
}
