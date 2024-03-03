'use strict';

/*  ====================================
        You can change these keybinds   
    ==================================== */

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
import Mousetrap from 'mousetrap';
import { DataParams } from 'select2';
// import tippy from 'tippy';

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
}

type EntityType = 'default'
    | 'character'
    | 'creature'
    | 'event'
    | 'family'
    | 'item'
    | 'journal'
    | 'location'
    | 'map'
    | 'note'
    | 'organisation'
    | 'quest'
    | 'race'
    | 'tag';

function parseBodyClasses(body: HTMLElement | JQuery<HTMLElement>): {
    entity: Entity,
    tags: Thing[],
} {
    if (body instanceof HTMLElement == false) {
        body = body[0];
    }

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
                    console.warn("what's this?", match);
                    break;
            }
        }
    });

    return { tags, entity };
}

const route = window.location.pathname;
const kanka = {
    csrfToken: document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content') as string,
    route,
    campaignID: (route.match(/w\/(\d+)\//) ?? [null, '0'])[1],
    entityID: (route.match(/w\/\d+\/entities\/(\d+)/) ?? [null, '0'])[1],

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
    }) as Record<EntityType, {
        headerLink?: boolean,
        sidebarLink?: boolean,
        multiple?: boolean,
    }>,
};

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

const templates = {
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

    TAG_SELECT: () => templates.SELECT_ELEMENT(`https://app.kanka.io/w/${kanka.campaignID}/search/tags`, 'Apply Tag'),
    TAG_URL: (tagID: string) => `https://app.kanka.io/w/${kanka.campaignID}/tags/${tagID}`,
    TAG_LINK: (tagID: string, text: string) => `
<a href="${templates.TAG_URL(tagID)}" title="Refresh to get full tooltip functionality">
    <span class="badge color-tag rounded-sm px-2 py-1">${text}</span>
</a>`.trim(),

    LOCATION_SELECT: () => templates.SELECT_ELEMENT(`https://app.kanka.io/w/${kanka.campaignID}/search/locations`, 'Move to...'),
    LOCATION_URL: (locationID: string) => `https://app.kanka.io/w/${kanka.campaignID}/entities/${locationID}`,
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
    params.append('entity', kanka.meta.entity.entityType);
    params.append('mode', 'table');
    params.append('models', kanka.meta.entity.id);
    params.append('undefined', '');

    return params;
}

function post(url: string, body: URLSearchParams): Promise<boolean> {
    return fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    })
        .then((response) => {
            console.log('Success:', response);
            response.body?.getReader().read()
                .then(content => {
                    const responseText = new TextDecoder().decode(content.value);
                    const body = responseText.match(/\<body[^\>]*?\>/);
                    if (body){
                        const newMeta = parseBodyClasses($(body[0]));
                        console.log({newMeta});
                    }
                });
            return response.ok;
        })
        .catch((error) => {
            console.error('Error:', error);
            return error.ok;
        });
}

function processLocationSelection(event: Select2Event) {
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
                let sidebar_Location = sidebar.find('.profile-location')
                if (!sidebar_Location) {
                    sidebar_Location = $('<div class="element profile-location">')
                    sidebar_Location.append($('<div class="title text-uppercase text-xs">Location</div>'));
                    sidebar.prepend(sidebar_Location);
                }

                const link = templates.LOCATION_LINK(locationID, text);
                if (thisEntityLocation.multiple) {
                    sidebar_Location.append(link);
                } else {
                    sidebar_Location.find('a').replaceWith(link);
                }
            }
        });
}

function processTagSelection(event: Select2Event) {
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

                        console.log('error', jqXHR, textStatus, errorThrown);
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

(function () {
    if (!document.body.className.includes('kanka-entity-')) {
        return;
    }

    for (const key in handlers) {
        Mousetrap.bind(key, handlers[key]);
    }

    console.log(kanka.meta);
})();
