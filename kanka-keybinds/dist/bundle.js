
// ==UserScript==
// @name         Kanka.io Keybinds
// @namespace    http://tampermonkey.net/
// @version      0.8.2
// @description  Set your own keyboard shortcuts for entity view page on Kanka.
// @author       Infinite
// @license      MIT
// @match        https://app.kanka.io/w/*/entities/*
// @icon         https://www.google.com/s2/favicons?domain=kanka.io
// @run-at       document-idle
// @grant        none
// @require      https://craig.global.ssl.fastly.net/js/mousetrap/mousetrap.min.js?a4098
// @require      https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 519:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
/*  ====================================
        You can change these keybinds
    ====================================
*/
const keybinds = {
    LABEL: 'l',
    MOVE: 'm',
    HELP: '?',
};
/*

## Combination of keys - generic mod helper sets cross platform shortcuts
    'mod+s' => command+s / ctrl+s

## Sequence of keys - keys separated by a space will be considered a sequence
    'g i'

## Shift key - handled magically
    '?' instead of 'shift+/'

## Text fields - keyboard events will not fire in textarea, input, or select
    enable with [class='mousetrap']

*/
/*  =======================================
        You probably shouldn't edit below
    ======================================= */
const mousetrap_1 = __importDefault(__webpack_require__(802));
function parseBodyClasses(body) {
    if (body instanceof HTMLElement == false) {
        body = body[0];
    }
    const classes = Array.from(body.classList);
    const entity = { id: '', entityType: 'default', type: '' };
    const tags = [];
    const regex = /^kanka-(\w+)-(\w+)$/;
    let tempTag = null;
    classes.forEach(className => {
        const match = className.match(regex);
        if (match) {
            const [, key, value] = match;
            const isValueNumeric = !isNaN(Number(value));
            switch (key) {
                case 'entity':
                    entity[isValueNumeric ? 'id' : 'entityType'] = value;
                    break;
                case 'type':
                    entity.type = value;
                    break;
                case 'tag':
                    if (isValueNumeric) {
                        tempTag = value;
                    }
                    else {
                        tags.push({
                            id: tempTag,
                            entityType: value,
                        });
                        tempTag = null;
                    }
                    break;
                default:
                    console.warn("what's this?", match);
                    break;
            }
        }
    });
    return { tags, entity };
}
const route = window.location.pathname;
const kanka = {
    csrfToken: (_a = document.head.querySelector('meta[name="csrf-token"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content'),
    route,
    campaignID: ((_b = route.match(/w\/(\d+)\//)) !== null && _b !== void 0 ? _b : [null, '0'])[1],
    entityID: ((_c = route.match(/w\/\d+\/entities\/(\d+)/)) !== null && _c !== void 0 ? _c : [null, '0'])[1],
    meta: parseBodyClasses(document.body),
    entityTypeHasLocation: ({
        default: {},
        character: { headerLink: true },
        location: { headerLink: true },
        map: { headerLink: true },
        organisation: { sidebarLink: true },
        family: { headerLink: true },
        creature: { sidebarLink: true, multiple: true },
        race: { sidebarLink: true, multiple: true },
        event: { sidebarLink: true },
        journal: { sidebarLink: true },
        item: { sidebarLink: true },
        tag: {},
        note: {},
        quest: {},
    }),
};
const handlers = {
    [keybinds.LABEL]: function (evt, combo) {
        initSelector(templates.TAG_SELECT, processTagSelection);
    },
    [keybinds.MOVE]: function (evt, combo) {
        initSelector(templates.LOCATION_SELECT, processLocationSelection);
    },
    [keybinds.HELP]: function (evt, combo) {
        // TODO show a modal describing the keybinds
    },
};
const templates = {
    SELECT_ELEMENT: (dataUrl, placeholder) => `
<select class="form-tags select2"
    style="width: 100%"
    data-url="${dataUrl}"
    data-allow-new="false"
    data-allow-clear="true"
    data-placeholder="${placeholder}"
    data-dropdown-parent="#app"
</select>`.trim(),
    SELECT_ITEM: (text, image) => {
        if (!!image) {
            return $(`
<span class="flex gap-2 items-center text-left">
    <img src="${image}" class="rounded-full flex-none w-6 h-6" />
    <span class="grow">${text}</span>
</span>`.trim());
        }
        return $(`<span>${text}</span>`);
    },
    TAG_SELECT: () => templates.SELECT_ELEMENT(`https://app.kanka.io/w/${kanka.campaignID}/search/tags`, 'Apply Tag'),
    TAG_URL: (tagID) => `https://app.kanka.io/w/${kanka.campaignID}/tags/${tagID}`,
    TAG_LINK: (tagID, text) => `
<a href="${templates.TAG_URL(tagID)}" title="Refresh to get full tooltip functionality">
    <span class="badge color-tag rounded-sm px-2 py-1">${text}</span>
</a>`.trim(),
    LOCATION_SELECT: () => templates.SELECT_ELEMENT(`https://app.kanka.io/w/${kanka.campaignID}/search/locations`, 'Move to...'),
    LOCATION_URL: (locationID) => `https://app.kanka.io/w/${kanka.campaignID}/entities/${locationID}`,
    LOCATION_LINK: (locationID, text) => `<a class="name" href="${templates.LOCATION_URL(locationID)}" title="Refresh to get full tooltip functionality">${text}</a>`,
    // TODO - get popper/tippy working to enable preview tooltips 
    // data-toggle="tooltip-ajax" data-id="${locationID}" data-url="${templates.LOCATION_URL(locationID)}/tooltip">
};
/// making my own container for the select to avoid any interference
function createFloatingElement(template) {
    let floatingDiv = document.getElementById('#infinite-select2');
    if (!floatingDiv) {
        floatingDiv = document.createElement('div');
        floatingDiv.id = 'infinite-select2';
        // Add styles to make it float and position it as needed
        floatingDiv.style.position = 'absolute';
        floatingDiv.style.top = '5%';
        floatingDiv.style.left = '41%';
        floatingDiv.style.minWidth = '200px';
        floatingDiv.style.width = '18%';
        floatingDiv.style.maxWidth = '400px';
    }
    floatingDiv.innerHTML = '';
    $(template()).appendTo(floatingDiv);
    document.body.appendChild(floatingDiv);
    return floatingDiv;
}
function createPostParams() {
    const params = new URLSearchParams();
    params.append('_token', kanka.csrfToken);
    params.append('datagrid-action', 'batch');
    params.append('entity', kanka.meta.entity.entityType);
    params.append('mode', 'table');
    params.append('models', kanka.meta.entity.id);
    params.append('undefined', '');
    return params;
}
function post(url, body) {
    return fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    })
        .then((response) => {
        var _a;
        console.log('Success:', response);
        (_a = response.body) === null || _a === void 0 ? void 0 : _a.getReader().read().then(content => {
            const responseText = new TextDecoder().decode(content.value);
            const body = responseText.match(/\<body[^\>]*?\>/);
            if (body) {
                const newMeta = parseBodyClasses($(body[0]));
                console.log({ newMeta });
            }
        });
        return response.ok;
    })
        .catch((error) => {
        console.error('Error:', error);
        return error.ok;
    });
}
function processLocationSelection(event) {
    const { id: locationID, text } = event.params.data;
    const params = createPostParams();
    params.append('location_id', locationID);
    post(`/w/${kanka.campaignID}/bulk/process`, params)
        .then(() => {
        const thisEntityLocation = kanka.entityTypeHasLocation[kanka.meta.entity.entityType];
        if (thisEntityLocation.headerLink) {
            const headerLink_Location = $($('[title="Location"]').next().next());
            if (!!headerLink_Location) {
                headerLink_Location.replaceWith(templates.LOCATION_LINK(locationID, text));
            }
        }
        if (thisEntityLocation.sidebarLink) {
            const sidebar = $('#sidebar-profile-elements > div').first();
            let sidebar_Location = sidebar.find('.profile-location');
            if (!sidebar_Location) {
                sidebar_Location = $('<div class="element profile-location">');
                sidebar_Location.append($('<div class="title text-uppercase text-xs">Location</div>'));
                sidebar.prepend(sidebar_Location);
            }
            const link = templates.LOCATION_LINK(locationID, text);
            if (thisEntityLocation.multiple) {
                sidebar_Location.append(link);
            }
            else {
                sidebar_Location.find('a').replaceWith(link);
            }
        }
    });
}
function processTagSelection(event) {
    const { id: tagID, text } = event.params.data;
    const params = createPostParams();
    const header = $('.entity-header .entity-header-text');
    if (header.has('.entity-tags').length == 0) {
        $('<div class="entity-tags entity-header-line text-xs flex flex-wrap gap-2"></div>')
            .insertBefore(header.find('.header-buttons'));
    }
    const tagBar = header.find('.entity-tags');
    const hasTag = !!kanka.meta.tags.find(tag => tag.id == tagID);
    if (hasTag) {
        const existingTag = tagBar.children(`[href="${templates.TAG_URL(tagID)}"]`)[0];
        if (!!existingTag) {
            params.append('bulk-tagging', 'remove');
            params.append('tags[]', tagID);
            params.append('save-tags', '1');
            post(`/w/${kanka.campaignID}/bulk/process`, params)
                .then(() => {
                existingTag.remove();
            });
            return;
        }
    }
    params.append('entities[]', kanka.meta.entity.id);
    params.append('tag_id', tagID);
    post(`/w/${kanka.campaignID}/tags/${tagID}/entity-add/`, params)
        .then((ok) => {
        ok && tagBar.append($(templates.TAG_LINK(tagID, text)));
    });
}
function initSelector(template, processSelection) {
    const floatingDiv = createFloatingElement(template);
    $(floatingDiv).find('select.select2')
        .each(function () {
        const me = $(this);
        me.select2({
            tags: false,
            placeholder: me.data('placeholder'),
            allowClear: me.data('allowClear') || true,
            language: me.data('language'),
            minimumInputLength: 0,
            dropdownParent: $(me.data('dropdownParent')) || '',
            width: '100%',
            sorter: (data) => {
                const term = $('input.select2-search__field').val().toLowerCase();
                return data.sort(byMatchiness(term));
            },
            ajax: {
                delay: 500, // quiet ms
                url: me.data('url'),
                dataType: 'json',
                data: (params) => { var _a; return ({ q: (_a = params.term) === null || _a === void 0 ? void 0 : _a.trim() }); },
                processResults: (data) => ({ results: data }),
                error: function (jqXHR, textStatus, errorThrown) {
                    if (textStatus === 'abort') {
                        // it does this for the empty field, I think?
                        return;
                    }
                    if (jqXHR.status === 503) {
                        window.showToast(jqXHR.responseJSON.message, 'error');
                    }
                    console.log('error', jqXHR, textStatus, errorThrown);
                    return { results: [] };
                },
                cache: true
            },
            templateResult: (item) => templates.SELECT_ITEM(item.text, item.image),
        })
            .on('select2:select', processSelection)
            .on('select2:close', () => {
            setTimeout(() => { $(floatingDiv).remove(); }, 100);
        });
        setTimeout(() => { me.select2('open'); }, 0);
    });
}
function byMatchiness(term) {
    return (a, b) => {
        const textA = a.text.toLowerCase();
        const textB = b.text.toLowerCase();
        // Assign a score based on how well the option matches the search term
        const scoreA = textA === term ? 3 : textA.startsWith(term) ? 2 : textA.includes(term) ? 1 : 0;
        const scoreB = textB === term ? 3 : textB.startsWith(term) ? 2 : textB.includes(term) ? 1 : 0;
        // Sort by score. If the scores are equal, sort alphabetically
        return scoreB - scoreA || textA.localeCompare(textB);
    };
}
(function () {
    if (!document.body.className.includes('kanka-entity-')) {
        return;
    }
    for (const key in handlers) {
        mousetrap_1.default.bind(key, handlers[key]);
    }
    console.log(kanka.meta);
})();


/***/ }),

/***/ 802:
/***/ ((module) => {

module.exports = Mousetrap;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(519);
/******/ 	
/******/ })()
;