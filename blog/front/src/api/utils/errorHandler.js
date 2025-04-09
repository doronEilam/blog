export const handleApiError = (error) => {
    if (error.response && error.response.status) {
        const { status } = error.response;
        switch (status) {
            case 401:
                return 'Unauthorized. Please log in again.';
            case 403:
                return 'Access denied. You do not have the necessary permissions.';
            case 404:
                return 'Not found.';
            case 500:
                return 'Internal server error. Please try again later.';
            default:
                return `An error occurred with status code ${status}. Please try again later.`;
        }
    } else if (error.request) {
        return 'The request could not be made. Please check your network connection.';
    } else {
        return 'An error occurred. Please try again later.';
    }
};