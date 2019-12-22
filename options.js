const getAllHistorykeys = async () => {
    all_histories = await getLocalStorageKeysObject()
    return all_histories.filter(value => {
        return value.match(/(\d+.*)/)
    })
}

const readableHistoryKey = (history_key) => {
    let subject = document.getElementById('subject')
    let date = history_key.split("_")[0].replace(/-/g, "/")
    let day_of_week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][history_key.split("_")[1]]
    let time = history_key.split("_")[2].replace(/-/g, ":")
    return `${date}(${day_of_week}) ${time}`
}

const createHistoryList = async () => {
    let all_histories = await getAllHistorykeys()
    let history_list_div = document.getElementById("history_list")
    history_list_div.innerHTML = ""

    let table = document.createElement('table')
    history_list_div.appendChild(table)
    table.style.borderWidth = "thin"
    table.style.borderStyle = "solid"
    table.rules = "all"
    table.style.fontSize = "medium"
    all_histories.forEach(async (item, index) => {
        let row = table.insertRow(0)

        row.insertCell(-1).appendChild(document.createTextNode(`${all_histories.length - index}`))
        var label = document.createElement('label')
        row.insertCell(-1).appendChild(label)
        var checkbox = document.createElement('input')
        checkbox.setAttribute('type', 'checkbox')
        checkbox.setAttribute('name', 'history_key')
        checkbox.setAttribute('value', item)
        label.appendChild(checkbox)
        label.appendChild(document.createTextNode(` ${readableHistoryKey(item)}`))

        let tabs_num = JSON.parse(await getLocalStorage(item)).length
        row.insertCell(-1).appendChild(document.createTextNode(`${tabs_num} tabs`))

        let button = document.createElement('button')
        row.insertCell(-1).appendChild(button)
        button.innerText = "Show"
        button.style.fontSize = "x-small"
        button.style.borderRadius = "10px"
        button.setAttribute('value', item)
        button.addEventListener("click", async () => {
            createSubjectFromStorage(button.value)
            createContents(await getLocalStorage(button.value))
        })
    });
}

window.onload = async () => {
    // initialize
    if (!await getLocalStorage("config_window_width")) {
        setLocalStorage("config_window_width", 1000)
    }
    if (!await getLocalStorage("config_max_histories")) {
        setLocalStorage("config_max_histories", 20)
    }
    if (!await getLocalStorage("config_view_type")) {
        setLocalStorage("config_view_type", 0)
    }

    let window_width = await getLocalStorage("config_window_width")
    document.getElementById("window_width").value = window_width
    let max_histories = await getLocalStorage("config_max_histories")
    document.getElementById("max_histories").value = max_histories
    let view_type = await getLocalStorage("config_view_type")
    document.getElementById("view_type").types.value = view_type
    createHistoryList()
}

document.getElementById("save").onclick = async () => {
    let window_width = document.getElementById("window_width").value
    setLocalStorage("config_window_width", window_width)
    let max_histories = document.getElementById("max_histories").value
    setLocalStorage("config_max_histories", max_histories)
    let view_type = document.getElementById("view_type").types.value
    setLocalStorage("config_view_type", view_type)
    createHistoryList()

    document.getElementById("result_save").innerHTML = "<font color=red>Saved!!</font>"
    await new Promise(resolve => setTimeout(resolve, 1000));
    document.getElementById("result_save").innerHTML = ""
}

document.getElementById("delete").onclick = async () => {
    let history_keys = document.getElementsByName("history_key")
    history_keys.forEach(elem => {
        if (elem.checked) {
            deleteLocalStorage(elem.value)
        }
    })
    createHistoryList()

    document.getElementById("result_delete").innerHTML = "<font color=blue>Deleted!!</font>"
    await new Promise(resolve => setTimeout(resolve, 1000));
    document.getElementById("result_delete").innerHTML = ""
}

document.getElementById("check_all").onclick = async () => {
    let history_keys = document.getElementsByName("history_key")
    history_keys.forEach(elem => {
        elem.checked = true
    })
}

document.getElementById("uncheck_all").onclick = async () => {
    let history_keys = document.getElementsByName("history_key")
    history_keys.forEach(elem => {
        elem.checked = false
    })
}


const createSubjectFromStorage = (select_value) => {
    let subject = document.getElementById('subject')
    let date = select_value.split("_")[0].replace(/-/g, "/")
    let day_of_week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][select_value.split("_")[1]]
    let time = select_value.split("_")[2].replace(/-/g, ":")
    subject.innerHTML = `${date}(${day_of_week}) ${time}`
}

const createContents = (tab_list_json) => {
    let tab_list = JSON.parse(tab_list_json)

    let contents = document.getElementById('view')
    contents.innerHTML = ""

    let tabs_num_div = document.createElement('div')
    contents.appendChild(tabs_num_div)
    tabs_num_div.innerHTML = `Tabs: ${tab_list.length}`

    let table = document.createElement('table')
    contents.appendChild(table)
    tab_list.forEach(item => {
        let title = item.title
        let url = item.url
        let favicon_url = item.favIconUrl
        let row = table.insertRow(-1)

        let favicon_elem = document.createElement('img')
        let regex = /http.*/
        if (regex.test(favicon_url)) {
            favicon_elem.src = favicon_url
        }
        favicon_elem.width = 16
        favicon_elem.height = 16
        row.insertCell(-1).appendChild(favicon_elem)

        let link_elem = document.createElement('a')
        link_elem.href = url
        link_elem.target = "_blank"
        link_elem.appendChild(document.createTextNode(title))
        row.insertCell(-1).appendChild(link_elem)
    });
}