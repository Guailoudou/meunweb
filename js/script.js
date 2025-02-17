let currentType = 'servers';
let currentPage = 1;
let totalPages = 1;
let Model = 0;
let currentQuery = '';
var currentLayout = 'default';
// const passwordHash = "6eea9b7ef19179a06954edd0f6c05ceb";
// const timeLimit = 7 * 24 * 60 * 60 * 1000;
// const maxAttempts = 4;
const itemsPerPage = 20;
const contentDiv = document.getElementById('content');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const loadingDiv = document.getElementById('loading');
const paginationDiv = document.getElementById('pagination');
const searchInput = document.getElementById('search-input');
var jsondata = []
var display_data = []
function updateTypeButtons() {
    document.getElementById('serversButton').classList.toggle('active', currentType === 'servers');
    document.getElementById('pluginButton').classList.toggle('active', currentType === 'plugin');
}

function search() {
    currentQuery = searchInput.value;
    display_data = filterArrayByKeywords(jsondata,currentQuery)
    display_data = sortArray(display_data, currentLayout)
    displayContent();
}

// searchInput.addEventListener('keypress', function(event) {
//     if (event.key === 'Enter') {
//         search();
//     }
// });

function changeLayout() {
    currentLayout = document.getElementById('layoutSelect').value;
}

async function fetchContent() {
    searchInput.value = '';
    document.getElementById('layoutSelect').value = 'default';
    showLoading();
    // configurl = './data.json'
    // const configresponse = await fetch(configurl);
    // const configdata = await configresponse.json();
    // data = configdata.datas;
    // apikey = configdata.api_key;
    // apiurl = configdata.api_url;
    // const facets = currentType === 'mod' ? [["project_type:mod"]] : [["project_type:plugin"]];
    // const url = `${apiurl}/api/service/remote_service_instances?daemonId=${daemonid}&page=${currentPage}&page_size=20&status=${Model!=0?Model:''}&instance_name=${currentQuery}`;
    const url = './data.json'
    try {
        const response = await fetch(url);
        const data = await response.json();
        jsondata = getcsvdata(data.datas);
        display_data = jsondata;
        await displayContent();
        // totalPages = data.datas;
        // updatePagination();
    } catch (error) {
        console.error('Error fetching data:', error);
        contentDiv.innerHTML += '获取数据时出错';
    } finally {
        hideLoading();
    }
}

async function displayContent() {
    items = display_data
    // console.log(items)
    if (items.length === 0) {
        contentDiv.innerHTML = '<h1>暂无内容</h1>';
        return;
    }
    contentDiv.innerHTML = '';
    for (const item of items) {
        const div = document.createElement('div');
        div.className = `item vertical`;
        const img = document.createElement('img');
        item.imgurl = item.imgurl || './image/default.jpg';
        img.src = item.imgurl;
        div.appendChild(img);
        const details = document.createElement('div');
        details.className = 'item-details';
        const title = document.createElement('div');
        title.className = 'item-title';
        title.textContent = item.title;
        details.appendChild(title);
        const tags = document.createElement('div');
        console.log(item.title,item.tags)
        if (item.tags.length == 0||item.tags[0] == '') {
            tags.className = 'userscore';
            tags.textContent = '暂无标签';
        }else{
            tags.className = 'userscore';
            tags.textContent = tags_toString(item.tags);
        }
        
        details.appendChild(tags);
        const description = document.createElement('div');
        description.className = 'item-description';
        description.textContent = item.description;
        details.appendChild(description);
        // item.scores = getscores(item.title);
        div.appendChild(renderRating(item.scores))
        div.appendChild(details);
        div.onclick = () => showDetails(item.title,item.modpackUrl);
        contentDiv.appendChild(div);
    }
    
    
}
function getcsvdata(items){
    for(const item in csvdata){
            // console.log(item)
            if(item != 'undefined'){ //undefined
                // console.log(item)
                obj = {title: item,description: '',imgurl: null,label:[],modpackUrl: []}
                addplaymeun(items,obj)
            }

    }
    for (const item of items) {
        item.scores = getscores(item.title);
        // item.tags = gettags(item.title);
        item.tags = item.label;
        item.average_score = item.scores.reduce((acc, cur) => acc + cur, 0) / item.scores.length
        if (item.scores.length == 0) {
            item.average_score = 0;
        }
    }
    // console.log(items)
    return items;
}
function renderRating(scores) {

    
    const score = scores.reduce((acc, cur) => acc + cur, 0) / scores.length;
    // console.log(scores)
    //四舍五入
    scoree = score.toFixed(0);
    const ratingContainer = document.createElement("div");
  

    const fullStars = Math.floor(scoree / 2);
    const hasHalfStar = scoree % 2 !== 0;

    for (let i = 0; i < fullStars; i++) {
        const star = document.createElement('span');
        star.className = 'star full-star';
        star.textContent = '\u2605'; // Full star character
        ratingContainer.appendChild(star);
    }

    if (hasHalfStar) {
        const halfStar = document.createElement('span');
        halfStar.className = 'star half-star';
        halfStar.innerHTML = '<span class="full-half-star">\u2605</span><span class="empty-half-star">\u2605</span>';
        ratingContainer.appendChild(halfStar);
    }
 
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '\u2605'; // Empty star character
        ratingContainer.appendChild(star);
    }
    const scoreText = document.createElement('span');
    scoreText.className = 'score-text';
    if (scores.length == 0) {
        scoreText.textContent = '暂无评分';
    }else{
        scoreText.textContent = score.toFixed(1);
    }
    
    ratingContainer.appendChild(scoreText);
    return ratingContainer;
}
async function showDetails(title,modpackUrl) {
    showLoading();
    try {

        const ullist = document.createElement('ul');
        if (csvdata[title] == undefined) {
            modalContent.innerHTML = `<h1>${title}</h1><p>暂无评论</p>`;
            modal.style.display = 'block';
            location.href = "#modal-content";
            return;
        }
        
        csvdata[title].forEach(element => {
            pl =element["你的评论（必填）"].replace(/\n/g,'\n\n')
            // console.log(pl);
            li = document.createElement('li');
            li.innerHTML = `
                <p class="userinfo"><strong>🧑‍💼${element["是否名称敏感（必填）"]=="是"?maskString(element["你的玩家ID"]):element["你的玩家ID"]}</strong>
                <strong class="userscore">${element["你的评分"]!=''?Number(element["你的评分"]).toFixed(1):'暂未评'}分</strong></p>
                <p class="userinfo"><strong>⏲️${element["提交时间（自动）"]}</strong> </p><hr>
                <div class="md"><strong>🧾评论</strong>:${marked.parse(element["你的评论（必填）"].replace(/\n/g,'\n\n'))} </div>
            `
            ullist.appendChild(li);
        });
        
        const urllist = document.createElement('ul');
        urlli = document.createElement('li');
        urlli.innerHTML = '<p>🔗相关链接：</p>'
        modpackUrl.forEach(element => {
            
            urlli.innerHTML += `
                <a href="${element.url}" target="_blank">
                <img src="https://img.shields.io/badge/${element.urlName}-${title}-Green?logo=${element.urlName}" alt="${title}"></img>
                </a>
            `
            
        });
        if(modpackUrl.length!=0&&modpackUrl!=null&&modpackUrl[0].urlName!=''){
            urllist.appendChild(urlli);
        }
            
        modalContent.innerHTML = `<h1>${title}</h1>`
        modalContent.appendChild(urllist);
        modalContent.appendChild(ullist);
        //info等待接入md
        modal.style.display = 'block'; 
        hljs.highlightAll();
        location.href = "#modal-content";
    } catch (error) {
        console.error('Error fetching project details:', error);
        modalContent.innerHTML += '获取项目详情时出错';
    } finally {
        hideLoading();
    }
}

function closeModal() {
    modal.style.display = 'none';
}

function objectToQueryString(obj) {
    return Object.keys(obj).map(key => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
    }).join('&');
}


function setModel(neModel) {
    Model = neModel;
    currentPage = 1;
    fetchContent();
}

// const themeSelect = document.getElementById('themeSelect');

// themeSelect.addEventListener('change', function() {
//     setModel(this.value);
// });

// function initializeTheme() {
//     const savedTheme = localStorage.getItem('theme') || 'browser';
//     setTheme(savedTheme);
//     themeSelect.value = savedTheme;
// }

// document.addEventListener('DOMContentLoaded', initializeTheme);

// if (window.matchMedia) {
//     window.matchMedia('(prefers-color-scheme: dark)').addListener(function(e) {
//         if (themeSelect.value === 'browser') {
//             setTheme('browser');
//         }
//     });
// }

function showLoading() {
    loadingDiv.style.display = 'block';
}

function hideLoading() {
    loadingDiv.style.display = 'none';
}

function updatePagination() {
    paginationDiv.innerHTML = '';
    if (totalPages > 1) {
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.innerHTML = '&lt;';
            prevButton.onclick = () => changePage(currentPage - 1);
            paginationDiv.appendChild(prevButton);
        }

        const currentPageSpan = document.createElement('span');
        currentPageSpan.textContent = `${currentPage} / ${totalPages}`;
        paginationDiv.appendChild(currentPageSpan);

        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.innerHTML = '&gt;';
            nextButton.onclick = () => changePage(currentPage + 1);
            paginationDiv.appendChild(nextButton);
        }
    }
}

function changePage(page) {
    currentPage = page;
    fetchContent();
}
// function login(){
//     if (localStorage.getItem('passwordVerified') === 'true'){
//         localStorage.removeItem('passwordVerified');
//         localStorage.removeItem('lastAccessTime');
//         localStorage.removeItem('gh_token');
//         alert('已退出登录');
//         location.reload();
//         return;
//     }

//     let attempts = parseInt(localStorage.getItem('attempts')) || 0;
//     let lastAttemptTime = localStorage.getItem('lastAttemptTime');
//     if (lastAttemptTime && Date.now() - parseInt(lastAttemptTime) < timeLimit && attempts >= maxAttempts) {
//         console.log("尝试次数过多，1小时内无法登录");
//         return;
//     }
//     let input = prompt("请输入密码：");
//     let inputHash = CryptoJS.MD5(input).toString();
//     if (inputHash === passwordHash) {
//         localStorage.setItem('passwordVerified', 'true');
//         localStorage.setItem('lastAccessTime', Date.now());
//         localStorage.setItem('gh_token', input);
//         localStorage.removeItem('attempts');
//         localStorage.removeItem('lastAttemptTime');
//         console.log("密码正确，登录成功");
//         document.getElementById('loginButton').innerText = '登出';
//         return;
//     } else {
//         attempts++;
//         localStorage.setItem('attempts', attempts);
//         localStorage.setItem('lastAttemptTime', Date.now());
//         alert("密码错误，剩余尝试次数：" + (maxAttempts - attempts));
//     }
// }



// const currentURL = window.location.href;
// const url = new URL(currentURL);
// const ip_address = url.host;

// function loadFont() {
//     const url = `http://${ip_address}/api/font`;
//     fetch(url, {method: 'GET'})
//         .then(response => response.json())
//         .then(data => {
//             const font = new FontFace('MinecraftAE', `url(${data.font_path})`);
//             font.load().then(function(loadedFont) {
//                 document.fonts.add(loadedFont);
//                 document.body.style.fontFamily = "'MinecraftAE', Arial, sans-serif";
//                 console.log('Font loaded successfully');
//             }).catch(function(error) {
//                 console.error('Error loading font:', error);
//             });
//         })
//         .catch(error => console.error('Error fetching font path:', error));
// }
// import { marked } from "marked";
// import customHeadingId from "marked-custom-heading-id";
// window.addEventListener('load', function() {
//     marked.use("marked-custom-heading-id");
    // if (localStorage.getItem('passwordVerified') === 'true'){
        
    //     const lastAccessTime = localStorage.getItem('lastAccessTime');
    //     if (Date.now() - parseInt(lastAccessTime) < timeLimit) {
    //         console.log("密码已验证，无需再次登录");
    //         document.getElementById('loginButton').innerText = '登出';
    //         return;
    //     } else {
    //         localStorage.removeItem('passwordVerified');
    //         localStorage.removeItem('lastAccessTime');
    //         localStorage.removeItem('gh_token');
    //     }
        
        
    // }
// });


// Override function
// const walkTokens = (token) => {
//   if (token.type === 'heading') {
//     token.depth += 1;
//   }
// };
// window.addEventListener('load', function() {
//     marked.use({ walkTokens });
// });
// Run marked
// console.log(marked.parse('# heading 2\n\n## heading 3'));
