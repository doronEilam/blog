export const handleApiError = (error) => {
    console.error('API Error:', error);
   
    if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
            return new Error("יש להתחבר מחדש כדי לבצע פעולה זו");
        }

        if (status === 403) {
            return new Error("אין לך הרשאה לבצע פעולה זו");
        }
 
        if (status === 400 && data) {
            const errorMsg = extractErrorMessage(data);
            if (errorMsg) {
                return new Error(errorMsg);
            }
        }

        if (status >= 500) {
            return new Error("שגיאת שרת, אנא נסה שנית מאוחר יותר");
        }

        if (data && data.detail) {
            return new Error(data.detail);
        }
    }

    if (error.request && !error.response) {
        return new Error("לא ניתן להתחבר לשרת, בדוק את החיבור לאינטרנט");
    }

    return new Error(error.message || "שגיאה לא ידועה, אנא נסה שנית");
};

const extractErrorMessage = (data) => {
    if (typeof data === 'string') {
        return data;
    }

    if (data.detail) {
        return data.detail;
    }

    if (data.non_field_errors && data.non_field_errors.length) {
        return data.non_field_errors.join(', ');
    }

    for (const field in data) {
        if (Array.isArray(data[field])) {
            return `${field}: ${data[field].join(', ')}`;
        }
    }
    
    return null;
};
