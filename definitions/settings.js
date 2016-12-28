// Reads custom settings
GETSCHEMA('Settings').workflow2('load');

// Disables analytic counter for administraion / manager
MODULE('webcounter').instance.onValid = req => !req.url.startsWith(CONFIG('manager-url'));

// Global static variables (default values)
F.global.blogs = [];
F.global.blogstags = [];
F.global.blogslatest = [];
F.global.commentslatest = [];