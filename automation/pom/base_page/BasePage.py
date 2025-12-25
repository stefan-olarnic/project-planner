class BasePage:
    """Base class for all Page Object Models"""
    
    def __init__(self, page, expected_url_fragment=None):
        self.page = page
        self.expected_url_fragment = expected_url_fragment
    
    def is_loaded(self, url_fragment=None, element_locator=None, timeout=3000):
        """
        Verify that the page is loaded
        
        Args:
            url_fragment: URL fragment to check (e.g., 'dashboard.html')
            element_locator: Optional element to verify visibility
            timeout: Timeout in milliseconds for element check
        
        Returns:
            bool: True if page is loaded, False otherwise
        """
        # Use provided fragment or default from __init__
        fragment = url_fragment or self.expected_url_fragment
        
        # Check URL
        if fragment and fragment not in self.page.url:
            return False
        
        # Optional: check if specific element is visible
        if element_locator:
            try:
                return self.page.locator(element_locator).is_visible(timeout=timeout)
            except:
                return False
        
        return True
    
    def wait_for_url(self, url_pattern, timeout=5000):
        """Wait for URL to match pattern"""
        self.page.wait_for_url(url_pattern, timeout=timeout)
