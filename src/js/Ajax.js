/**
 * MaterialDesignIcons-Picker
 * Ajax
 */

/**
 * Super simple ajax request
 */
const request = (url, method='GET') => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            }
            else {
                reject(new Error(xhr.statusText));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Network error'));
        };

        xhr.send();
    });
};

export { request };
