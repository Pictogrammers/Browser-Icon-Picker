/**
 * MaterialDesignIcons-Picker
 * Ajax
 */

/**
 * Super simple xhr request
 */
export const request = (url: string, method = 'GET'): Promise<string> => {
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

export const download = (href: string, filename: string): void => {
  const a = document.createElement('a')
  a.href = href
  a.download = filename;
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
