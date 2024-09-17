type EntityType = 'default' | 'character' | 'creature' | 'event' | 'family' | 'item' | 'journal' | 'location' | 'map' | 'note' | 'organisation' | 'quest' | 'race' | 'tag';
declare global {
    type Maybe<T> = NonNullable<T> | undefined;
    type Dictionary<T> = Record<string, T>;
    type Thing = {
        entityType: string;
        id: string;
    };
    type Entity = Thing & {
        entityType: EntityType;
        type: string;
    };
    type toastBackground = 'bg-primary' | 'bg-secondary' | 'bg-success' | 'bg-accent' | 'bg-neutral' | 'bg-warning' | 'bg-error';
    type toastText = 'text-primary-content' | 'text-success-content' | 'text-accent-content' | 'text-neutral-content' | 'text-warning-content' | 'text-error-content';
    type toastClasses = `${toastBackground} ${toastText}`;
    interface Window {
        jQuery: JQueryStatic;
        ajaxTooltip: Function;
        /**
         * @param message
         * @param messageType
         * @returns
         */
        showToast: (message: string, messageType: 'error' | toastClasses | null) => void;
    }
}
declare function getElementPromise(...selectorChain: string[]): Promise<JQuery<HTMLElement>>;
/**
 * Extract metadata from the classes on the <body>
 */
declare function parseBodyClasses(body: HTMLElement): {
    entity: Entity;
    tags: Thing[];
};
/**
 * Builds a comparison function for sorting by similarity to a provided term.
 * Intended for sorting typeahead results.
*/
declare function createMatchinessComparator<TItem extends Object>(term: string, converter?: (item: TItem) => string): (a: TItem, b: TItem) => number;
declare const _default: {
    Uri: {
        rootUri: string;
        route: string;
        buildUri: (...segments: string[]) => string;
        getEditUri: () => string | null;
        getEntityUri: () => string | null;
    };
    Session: {
        csrfToken: string;
        campaignID: string;
    };
    Entity: {
        /**
         *  this is the plural, not values from EntityType
         */
        entityType: string;
        /**
         *  this is the 'larger' ID: entities/__[5328807]__ === characters/1357612
         */
        entityID: string;
        /**
         * this is the 'smaller' ID: entities/5328807 === characters/__[1357612]__
         */
        typedID: string;
        meta: {
            entity: Entity;
            tags: Thing[];
        };
    };
    EntityTypeAttributes: {
        /**
         * this encapsulates the definitions from the system
         * - some entities have a location, some don't
         * - some entities have a link in the header, some use the sidebar
         * - some entities can have multiple locations, some can't
         */
        hasLocation: Record<EntityType, {
            headerLink?: boolean;
            sidebarLink?: boolean;
            multiple?: boolean;
        }>;
    };
    Util: {
        createMatchinessComparator: typeof createMatchinessComparator;
        getElementPromise: typeof getElementPromise;
        parseBodyClasses: typeof parseBodyClasses;
    };
    Api: {
        getXMLHttpRequest: (method: "GET" | "POST" | string) => XMLHttpRequest;
        headers: {
            setCsrf: (xhr: XMLHttpRequest) => void;
            setXMLHttpRequest: (xhr: XMLHttpRequest) => void;
        };
        createPostParams: () => URLSearchParams;
        fetch_success: (response: Response) => Promise<{
            ok: boolean;
            document: JQuery.Node[];
        }>;
        post: (url: string, body: URLSearchParams) => Promise<{
            ok: boolean;
            document: JQuery.Node[];
            error?: unknown;
        }>;
    };
};
//# sourceMappingURL=main.d.ts.map

export { _default as default };
