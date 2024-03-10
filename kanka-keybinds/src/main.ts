'use strict';

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
    enable on an element with [class='mousetrap']

*/

/*  =======================================================
        You probably shouldn't edit below... probably.
        Here there be `Dragons : Reptile<Mythical>[]`
    ======================================================= */
import Mousetrap from 'mousetrap';
import { DataParams } from 'select2';
// import tippy from 'tippy';

const emit_debug = console.log;

declare global {
    type MousetrapCallback = (e: Mousetrap.ExtendedKeyboardEvent, combo: string) => void;
    type Select2Event = Select2.Event<HTMLElement, DataParams>;
    type Select2EventHandler = (event: Select2Event) => void;

    type Maybe<T> = NonNullable<T> | undefined;
    type Dictionary<T> = Record<string, T>;
    type Thing = { entityType: string, id: string };
    type Entity = Thing & { entityType: EntityType, type: string };
    interface Window {
        jQuery: JQueryStatic;
        ajaxTooltip: Function;
        showToast: (message: string, messageType: string) => void;
    }
    interface JQuery<TElement = HTMLElement> {
        blink: (times: number, duration: number) => JQuery<TElement>;
    }
}

type EntityType = 'default' | 'character' | 'creature' | 'event' | 'family' | 'item'
    | 'journal' | 'location' | 'map' | 'note' | 'organisation' | 'quest' | 'race' | 'tag';

// this is a jQuery 'plugin' to make an element blink
$.prototype.blink = function (times: number, duration: number) {
    for (let i = 0; i < times; i++) {
        this.animate({ opacity: 0 }, duration)
            .animate({ opacity: 1 }, duration);
    }
    return this;
}

/**
 * Extract metadata from the classes on the <body>
 */
function parseBodyClasses(body: HTMLElement): {
    entity: Entity,
    tags: Thing[],
} {
    const classes = Array.from(body.classList);

    const entity: Entity = { id: '', entityType: 'default', type: '' };
    const tags: Thing[] = [];

    const regex = /^kanka-(\w+)-(\w+)$/;

    let tempTag: string | null = null;

    classes.forEach(className => {
        const match = className.match(regex);
        if (match) {
            const [, key, value] = match;
            const isValueNumeric = !isNaN(Number(value));

            switch (key) {
                case 'entity':
                    entity[isValueNumeric ? 'id' : 'entityType'] = value as EntityType;
                    break;
                case 'type':
                    entity.type = value;
                    break;
                case 'tag':
                    if (isValueNumeric) {
                        tempTag = value;
                    } else {
                        tags.push({
                            id: tempTag!,
                            entityType: value,
                        });
                        tempTag = null;
                    }
                    break;
                default:
                    emit_debug("what's this?", match);
                    break;
            }
        }
    });

    return { entity, tags };
}

const route = window.location.pathname;
// using the edit button is necessary to get the typedID and the plural :\
const editButtonLink = $('div#entity-submenu a[href$="edit"]').attr('href')
    ?? $('div.header-buttons a[href$="edit"]').attr('href');

/** 
 * This contains "all" the Kanka-specific data 
 */
const kanka = {
    rootUri: 'https://app.kanka.io',
    getUri: (...segments: string[]) => [kanka.rootUri, 'w', kanka.campaignID, ...segments].join('/'),
    /**
     * Ye olde CSRF token
     */
    csrfToken: document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content') as string,
    route,
    campaignID: (route.match(/w\/(\d+)\//) ?? [null, '0'])[1],

    /**
     *  this is the plural, not values from EntityType
     */
    entityType: (editButtonLink?.match(/\/(\w+)\/\d+\/edit$/) ?? [null, '0'])[1],
    /**
     *  this is the 'larger' ID: entities/__[5328807]__ === characters/1357612
     */
    entityID: (route.match(/w\/\d+\/entities\/(\d+)/) ?? [null, '0'])[1],
    /**
     * this is the 'smaller' ID: entities/5328807 === characters/__[1357612]__
     */
    typedID: (editButtonLink?.match(/\/(\d+)\/edit$/) ?? [null, '0'])[1],

    meta: parseBodyClasses(document.body),

    /**
     * this encapsulates the definitions from the system
     * - some entities have a location, some don't
     * - some entities have a link in the header, some use the sidebar
     * - some entities can have multiple locations, some can't
     */
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
    }) as Record<EntityType, {
        headerLink?: boolean,
        sidebarLink?: boolean,
        multiple?: boolean,
    }>,
    bulkEditUrl: '',
    entityEditUrl: '',
};

kanka.bulkEditUrl = kanka.getUri('bulk/process');
kanka.entityEditUrl = kanka.getUri(kanka.entityType, kanka.typedID);

const identifiers = {
    Sidebar: {
        Class: '.entity-sidebar' as '.entity-sidebar',
        ProfileClass: '.sidebar-section-profile' as '.sidebar-section-profile',
        ProfileElementsID: '#sidebar-profile-elements' as '#sidebar-profile-elements',
    },
};

const templates = {
    SIDEBAR_PROFILE: () => `
<div class="sidebar-section-box ${identifiers.Sidebar.ProfileClass.slice(1)} overflow-hidden flex flex-col gap-2">
    <div class="sidebar-section-title cursor-pointer text-lg user-select border-b element-toggle" data-animate="collapse" data-target="#sidebar-profile-elements">
        <i class="fa-solid fa-chevron-up icon-show " aria-hidden="true"></i>
        <i class="fa-solid fa-chevron-down icon-hide " aria-hidden="true"></i>
        Profile
    </div>

    <div class="sidebar-elements grid overflow-hidden" id="${identifiers.Sidebar.ProfileElementsID.slice(1)}">
    </div>
</div>`.trim(),

    SELECT_ELEMENT: (dataUrl: string, placeholder: string) => `
<select class="form-tags select2"
    style="width: 100%"
    data-url="${dataUrl}"
    data-allow-new="false"
    data-allow-clear="true"
    data-placeholder="${placeholder}"
    data-dropdown-parent="#app"
</select>`.trim(),

    SELECT_ITEM: (text: string, image: string) => {
        if (!!image) {
            return $(`
<span class="flex gap-2 items-center text-left">
    <img src="${image}" class="rounded-full flex-none w-6 h-6" />
    <span class="grow">${text}</span>
</span>`.trim());
        }
        return $(`<span>${text}</span>`);
    },

    TAG_SELECT: () => templates.SELECT_ELEMENT(kanka.getUri('search/tags'), 'Apply Tag'),
    TAG_URL: (tagID: string) => kanka.getUri('tags', tagID),
    TAG_LINK: (tagID: string, text: string) => `
<a href="${templates.TAG_URL(tagID)}" title="Refresh to get full tooltip functionality">
    <span class="badge color-tag rounded-sm px-2 py-1">${text}</span>
</a>`.trim(),

    LOCATION_SELECT: () => templates.SELECT_ELEMENT(kanka.getUri('search/locations'), 'Move to...'),
    LOCATION_URL: (locationID: string) => kanka.getUri('entities', locationID),
    LOCATION_LINK: (locationID: string, text: string) =>
        `<a class="name" href="${templates.LOCATION_URL(locationID)}" title="Refresh to get full tooltip functionality">${text}</a>`,
    // TODO - get popper/tippy working to enable preview tooltips 
    // data-toggle="tooltip-ajax" data-id="${locationID}" data-url="${templates.LOCATION_URL(locationID)}/tooltip">
};

/// making my own container for the select to avoid any interference
function createFloatingElement(template: () => string) {
    let floatingDiv = document.getElementById('#infinite-select2')

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

function createPostParams(): URLSearchParams {
    const params = new URLSearchParams();
    params.append('_token', kanka.csrfToken);
    params.append('datagrid-action', 'batch');
    // this needs the plural
    params.append('entity', kanka.entityType);
    params.append('mode', 'table');
    // typedID is different from entityID
    params.append('models', kanka.typedID);
    params.append('undefined', '');

    return params;
}

async function fetch_success(response: Response): Promise<{ ok: boolean, document: JQuery.Node[] }> {
    emit_debug('Success:', response);
    return { ok: response.ok, document: $.parseHTML(await response.text()) ?? [] };
}

function post(url: string, body: URLSearchParams): Promise<{ ok: boolean, document: JQuery.Node[], error?: unknown }> {
    return fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    })
        .then(fetch_success)
        .catch((error) => {
            console.error('Error:', error);
            return { ok: false, document: [], error };
        });
}

async function edit(body: FormData): Promise<{ ok: boolean, document: JQuery.Node[], error?: unknown }> {
    // wat da faq
    emit_debug({ edit_data: [...(body as any).entries()] });
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('POST', kanka.entityEditUrl, false);
    xhr.setRequestHeader('x-csrf-token', kanka.csrfToken);
    xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
    xhr.send(body);

    emit_debug({ req: xhr });
    return {
        ok: xhr.status == 200,
        document: $.parseHTML(xhr.responseText),
    };

    return fetch(kanka.entityEditUrl, {
        method: 'POST',
        headers: {
            "x-csrf-token": kanka.csrfToken,
            "x-requested-with": "XMLHttpRequest"
        },
        redirect: 'follow',
        body,
    })
        .then(fetch_success)
        .catch((error) => {
            console.error('Error:', error);
            return { ok: false, document: [], error };
        });
}


/**
 * Reacts when Location is selected via floaty dropdown. Sets the Location of the entity.
 * 
 * @param event - The Select2 event object.
 * @returns A promise that resolves to a boolean indicating whether the processing was successful.
 */
async function processLocationSelection(event: Select2Event): Promise<boolean> {

    const { id: locationID, text } = event.params.data;

    const thisEntityTypeHasLocation = kanka.entityTypeHasLocation[kanka.meta.entity.entityType];

    if (thisEntityTypeHasLocation.multiple) {
        alert('This entity type can have multiple locations. This feature is not yet implemented.');
        /**
         * For the curious, it's because the edit endpoint needs:
         * - the list of typed IDs (which we don't have)
         * - some weird voodoo with XHR that I can't replicate (I get a 405 Method Not Allowed)
         */

        return false;
        const data = new FormData();
        data.append('_token', kanka.csrfToken);
        // this is kinda BS, but it's the cleanest way to get 
        // - the list of typed IDs
        // - the other stuff

        const editable = await fetch(kanka.getUri('creatures', kanka.typedID, 'edit'), {
            method: 'GET',
            headers: { 'Content-Type': 'text/html' }
        })
            .then(fetch_success);

        if (!editable.ok) {
            emit_debug('Error:', editable);
            return false;
        }

        $(editable.document)
            .find('form#entity-form')
            .serializeArray()
            // .filter(kvp => {
            //     if (kvp.value == '') return false;
            //     if (kvp.value == '0') return false;
            //     if (kvp.value == 'inherit') return false;
            // })
            .forEach(kvp => data.append(kvp.name, kvp.value))

        data.append('locations[]', locationID);

        const response = await edit(data);
        if (response.ok) {
            const doc = $(response.document)
            emit_debug({
                header: doc.find('.entity-header'),
                sidebar: doc.find('#sidebar-profile-elements'),
            });
        }

        return response.ok;
    }

    const params = createPostParams();
    params.append('location_id', locationID);

    const response = await post(kanka.bulkEditUrl, params);

    if (!response.ok) {
        emit_debug('Error:', response);
        return false;
    }

    const sub = (selector: string) => {
        $(selector).replaceWith($(response.document).find(selector));
        return $(selector);
    };

    const ensure = (parent: JQuery, selector: string, defaultValue: string) => {
        if ($(selector).length == 0) {
            emit_debug(`adding ${selector} to ${parent}`);
            parent.append(defaultValue);
        }
    };

    if (thisEntityTypeHasLocation.headerLink) {
        // TODO [2024-03-06] - reduce the replacement scope to keep more functionality
        sub('.entity-header')
            .find('.entity-header-sub')
            .blink(3, 125);
    }

    if (thisEntityTypeHasLocation.sidebarLink) {
        const sidebar = $(identifiers.Sidebar.Class);
        // make sure the sidebar has the relevant childrens
        ensure(sidebar, identifiers.Sidebar.ProfileClass, templates.SIDEBAR_PROFILE());
        // an entity might have the sidebar, but not the Profile block
        ensure(sidebar, identifiers.Sidebar.ProfileElementsID, `<div id="${identifiers.Sidebar.ProfileElementsID.slice(1)}"></div>`);
        // and the Profile block may or may not have the Location
        ensure(sidebar.find(identifiers.Sidebar.ProfileElementsID), '.profile-location', `<div class="profile-location"></div>`);
        sub(identifiers.Sidebar.ProfileElementsID)
            .find('.profile-location')
            .blink(3, 125);
    }

    return true;
}

/**
 * Reacts when a Tag is selected via floaty dropdown. Toggles the presence of the tag on the entity.
 * 
 * @param event - The Select2 event object.
 * @returns A promise that resolves to a boolean indicating whether the processing was successful.
 */
async function processTagSelection(event: Select2Event): Promise<boolean> {
    const { id: tagID, text } = event.params.data;
    const params = createPostParams();
    params.append('save-tags', '1');
    params.append('tags[]', tagID);

    const header = $('.entity-header .entity-header-text');

    if (header.has('.entity-tags').length == 0) {
        $('<div class="entity-tags entity-header-line text-xs flex flex-wrap gap-2"></div>')
            .insertBefore(header.find('.header-buttons'));
    }

    const hasTag = !!kanka.meta.tags.find(tag => tag.id == tagID);
    params.append('bulk-tagging', hasTag ? 'remove' : 'add');

    const result = await post(`/w/${kanka.campaignID}/bulk/process`, params);
    const tagBar = header.find('.entity-tags');
    if (result.ok) {
        (hasTag
            ? tagBar.children().remove(`[href="${templates.TAG_URL(tagID)}"]`)
            : tagBar.append($(templates.TAG_LINK(tagID, text))))
            .blink(3, 125);
    }

    return result.ok;
    /*
        // was doing it using the simple 'add entity under tag' API
        // but why not consolidate?
        params.append('entities[]', kanka.meta.entity.id);
        params.append('tag_id', tagID);
    
        post(kanka.getUri('tags', tagID, 'entity-add'), params)
            .then((ok) => ok && tagBar.append($(templates.TAG_LINK(tagID, text))));
    */
}

function initSelector(template: () => string, processSelection: Select2EventHandler) {

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
                sorter: (data: (Select2.IdTextPair | Select2.OptGroupData | Select2.OptionData)[]) => {
                    const term = ($('input.select2-search__field').val() as string).toLowerCase();
                    return data.sort(byMatchiness(term));
                },
                ajax: {
                    delay: 500, // quiet ms
                    url: me.data('url'),
                    dataType: 'json',
                    data: (params) => ({ q: params.term?.trim() }),
                    processResults: (data) => ({ results: data }),
                    error: function (jqXHR, textStatus, errorThrown) {
                        if (textStatus === 'abort') {
                            // it does this for the empty field, I think?
                            return;
                        }
                        if (jqXHR.status === 503) {
                            window.showToast(jqXHR.responseJSON.message, 'error');
                        }

                        emit_debug('error', jqXHR, textStatus, errorThrown);
                        return { results: [] };
                    },
                    cache: true
                },
                templateResult: (item: any) => templates.SELECT_ITEM(item.text, item.image),
            })
                .on('select2:select', processSelection)
                .on('select2:close', () => {
                    setTimeout(() => { $(floatingDiv).remove(); }, 100);
                });

            setTimeout(() => { me.select2('open'); }, 0);
        });
}

function byMatchiness(term: string) {
    return (
        a: Select2.IdTextPair | Select2.OptGroupData | Select2.OptionData,
        b: Select2.IdTextPair | Select2.OptGroupData | Select2.OptionData) => {
        const textA = a.text.toLowerCase();
        const textB = b.text.toLowerCase();

        // Assign a score based on how well the option matches the search term
        const scoreA = textA === term ? 3 : textA.startsWith(term) ? 2 : textA.includes(term) ? 1 : 0;
        const scoreB = textB === term ? 3 : textB.startsWith(term) ? 2 : textB.includes(term) ? 1 : 0;

        // Sort by score. If the scores are equal, sort alphabetically
        return scoreB - scoreA || textA.localeCompare(textB);
    };
}

/**
 * Map the keybinds to the handlers
 */
const handlers: Record<string, MousetrapCallback> = {
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

(function () {
    if (!document.body.className.includes('kanka-entity-')) {
        return;
    }

    for (const key in handlers) {
        Mousetrap.bind(key, handlers[key]);
    }

    emit_debug({ kanka });
})();
