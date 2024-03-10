## Kanka Atomic Entity Editor

Allows entity pages to respond to a small number of new hotkeys with single-field edits, such as tagging or setting location.

These hotkeys may be customized in the userscript easily.

### `L` - Label

Opens a popup auto-suggest against the campaign's tags. 

Selecting a tag applies it to the current entity. If the tag is already present, it removes it instead.

Does not support creating new tags.

### `M` - Move to Location

Opens a popup auto-suggest against the campaign's locations. 

Selecting a location sets the current entity's location to that value. 

> **Multiple Locations** - not yet supported  
> There is additional complexity when the entity type supports multiple locations, 
> and this is not currently working.

---

### Planned Features [not yet implemented]

### `?` - Help

Opens a modal showing the keys and actions, similar to this content.

### `E` `T` - Edit Type

Opens a popup allowing input of Type text with the standard typeahead. 

### `E` `T` - Edit Parent

Opens a popup auto-suggest against the same entity type.
