let open_date

const initSelectBox = () => {
    let select_box = document.getElementById("select-key")
    select_box.innerHTML = ""
}

const getAllHistorykeys = async () => {
    let all_histories = await getLocalStorageKeysObject()
    return all_histories.filter(value => {
        return value.match(/(\d+.*)|(Now)/)
    })
}

const createList = async () => {
    initSelectBox()
    let all_histories = await getAllHistorykeys()
    console.log(all_histories)
    let select_box = document.getElementById("select-key")
    all_histories.forEach((item, index) => {
        let option = document.createElement("option");
        option.value = item
        option.text = item
        if (item != "Now") {
            // 「YYYY-MM-DD_曜日_hh-mm-ss」のフォーマットで取得される
            let item_date = item.split("_")[0].replace(/-/g, "/")
            let item_day_of_week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][item.split("_")[1]]
            let item_time = item.split("_")[2].replace(/-/g, ":")
            let shaped_text = `${(all_histories.length - index - 1).toString().padStart(2, "0")}: ${item_date}(${item_day_of_week}) ${item_time}`
            option.text = shaped_text
        }
        select_box.insertBefore(option, select_box.firstChild);
    });
    select_box[0].selected = true
}

const createSubjectOnLoaded = () => {
    let subject = document.getElementById('subject')
    let today = `${open_date.getFullYear()}/${(open_date.getMonth() + 1).toString().padStart(2, "0")}/${open_date.getDate().toString().padStart(2, "0")}`
    let day_of_week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][open_date.getDay()]
    let time = `${open_date.getHours().toString().padStart(2, "0")}:${open_date.getMinutes().toString().padStart(2, "0")}:${open_date.getSeconds().toString().padStart(2, "0")}`
    subject.innerHTML = `${today}(${day_of_week}) ${time}`
}

const createSubjectFromStorage = (select_value) => {
    let subject = document.getElementById('subject')
    let date = select_value.split("_")[0].replace(/-/g, "/")
    let day_of_week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][select_value.split("_")[1]]
    let time = select_value.split("_")[2].replace(/-/g, ":")
    subject.innerHTML = `${date}(${day_of_week}) ${time}`
}

const generateJSON = async () => {
    let tab_info = await getTabsinfo()
    let array = []
    tab_info.forEach(item => {
        let obj = {
            title: item.title,
            url: item.url,
            favIconUrl: item.favIconUrl
        }
        array.push(obj)
    });
    return JSON.stringify(array)
}

const createContents = async (tab_list_json) => {
    let tab_list = JSON.parse(tab_list_json)

    let contents = document.getElementById('contents')
    contents.innerHTML = ""

    let tabs_num_div = document.createElement('div')
    contents.appendChild(tabs_num_div)
    tabs_num_div.innerHTML = `Tabs: ${tab_list.length}`

    let view_type = document.getElementById("view_type").types.value
    if (view_type == 0) {
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
    } else if (view_type == 1) {
        let button = document.createElement('button')
        contents.appendChild(button)
        button.innerText = "Clipboard Copy"
        contents.appendChild(document.createElement('br'))

        let textarea = document.createElement('textarea')
        contents.appendChild(textarea)
        textarea.style.width = "700px"
        textarea.style.height = "300px"
        tab_list.forEach(item => {
            textarea.value += `[${item.title}](${item.url})\r\n`
        });
        button.addEventListener("click", () => {
            navigator.clipboard.writeText(textarea.value);
        })
    } else if (view_type == 2) {
        let button = document.createElement('button')
        contents.appendChild(button)
        button.innerText = "Clipboard Copy"
        button.addEventListener("click", () => {
            navigator.clipboard.writeText(tab_list_json);
        })
        contents.appendChild(document.createElement('br'))

        let textarea = document.createElement('textarea')
        contents.appendChild(textarea)
        textarea.style.width = "700px"
        textarea.style.height = "300px"
        textarea.value += tab_list_json
    }
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

    open_date = new Date();
    document.getElementById("view_type").types.value = await getLocalStorage("config_view_type")
    document.body.style.width = `${await getLocalStorage("config_window_width")}px`
    createSubjectOnLoaded()
    let tab_list_json = await generateJSON()
    createContents(tab_list_json)

    setLocalStorage("Now", tab_list_json)
    createList()
}


const deleteCapacityOverData = async () => {
    const max = parseInt(await getLocalStorage("config_max_histories"))
    let all_histories = await getAllHistorykeys()
    if (all_histories.length >= max + 2) {
        await deleteLocalStorage(all_histories[0])
    }
}

document.getElementById("save-button").onclick = async () => {
    createContents()
    let today = `${open_date.getFullYear()}-${(open_date.getMonth() + 1).toString().padStart(2, "0")}-${open_date.getDate().toString().padStart(2, "0")}`
    let day_of_week = open_date.getDay()
    let time = `${open_date.getHours().toString().padStart(2, "0")}-${open_date.getMinutes().toString().padStart(2, "0")}-${open_date.getSeconds().toString().padStart(2, "0")}`

    let contents_json = await getLocalStorage("Now")
    setLocalStorage(`${today}_${day_of_week}_${time}`, contents_json)
    await deleteCapacityOverData()
    createList()

    document.getElementById("result_save").innerHTML = "<font color=red>Saved!!</font>"
}

document.getElementById("delete-button").onclick = async () => {
    let select = document.getElementById("select-key")
    await deleteLocalStorage(select.value)
    createList()

    document.getElementById("result_delete").innerHTML = "<font color=blue>Deleted!!</font>"
    await new Promise(resolve => setTimeout(resolve, 1000));
    document.getElementById("result_delete").innerHTML = ""
}


const recreateContents = async () => {
    let select = document.getElementById("select-key")
    if (select.value == "Now") {
        createSubjectOnLoaded()
    } else {
        createSubjectFromStorage(select.value)
    }
    let contents_json = await getLocalStorage(select.value)
    createContents(contents_json)
}

document.getElementById("select-key").onchange = () => {
    recreateContents()
}

document.getElementById("view_type").onchange = () => {
    recreateContents()
}
