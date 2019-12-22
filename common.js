const setLocalStorage = (key, value) => {
    chrome.storage.local.set(
        {
            [key]: value
        }
    );
}

const getLocalStorage = (key) => {
    return new Promise(resolve => {
        chrome.storage.local.get(key, value => {
            resolve(value[key])
        });
    })
}

const getLocalStorageKeys = () => {
    return new Promise(resolve => {
        chrome.storage.local.get(null, value => {
            resolve(value)
        });
    })
}

const deleteLocalStorage = (key) => {
    return new Promise(resolve => {
        chrome.storage.local.remove(key, value => {
            resolve(value)
        });
    })
}

const getTabsinfo = () => {
    return new Promise(resolve => {
        let query = {
            currentWindow: true
        }
        chrome.tabs.query(query, result => {
            resolve(result)
        });
    })
}

const getLocalStorageKeysObject = async () => {
    let all_data = await getLocalStorageKeys()
    return Object.keys(all_data)
}
