<div class="frame">
    <div class="characters">
        {assign i = 0}
        {foreach char of $characters.values()}
            <div class="button" data-charname="{@$char.name}" onclick="{serialize $page}.char_onclick(this, event)">
                <span>{@$char.name}</span>
                <span class="dots">
                    <i class="fa fa-caret-down"></i>
                </span>
            </div>
            {$i++}
        {/foreach}
        <div class="button add" onclick="{serialize $page}.on_file_upload(event)">
            <span class="dots">
                <i class="fa fa-plus"></i>
            </span>
        </div>
    </div>

    <div class="search">
        <input autocomplete="off" type="text" class="search" placeholder="Item search..." value="{@$page.query}" oninput="{serialize $page}.search_oninput(this);">
        <div class="button" style="display: none;">
            <span>Sort</span>
            <span class="dots">
                <i class="fa fa-sort"></i>
            </span>
        </div>
    </div>

    <div class="items">
        {assign sort_by_char = false}
        {assign char_idx = 0}
        {assign storage_order_by_name = {\}}
        {foreach char of $characters.values()}
            {assign storage_idx = 0}
            {foreach storage of $char.storages.values()}
                {if $storage.name?.startsWith("*AccountStorage_") && $char != $latest_char}
                    {continue}
                {/if}
                {if $sort_by_char}
                    {assign order = $char_idx * 1000 + $storage_idx}
                {else}
                    {if $storage_order_by_name[$storage.name] === undefined}
                        {$storage_order_by_name[$storage.name] = Object.keys($storage_order_by_name).length}
                    {/if}
                    {assign order = $storage_order_by_name[$storage.name]}
                {/if}

                {if $storage.name?.startsWith("*AccountStorage_")}
                    {assign char_name = '<span title="Taken from ' + $char.name + '\'s report">(Account Storage)</span>'}
                    {assign storage_name = $storage.name.substring("*AccountStorage_".length)}
                {else}
                    {assign char_name = $char.name}
                    {assign storage_name = $storage.name || "Inventory"}
                {/if}

                {hascontent}
                    <div class="container" style="order: {@$order}">
                        <div class="header">
                            <span class="character">{@$char_name}</span>
                            <span class="name">{@$storage_name}</span>
                        </div>
                        <div class="body">
                            {content}
                                {foreach item of $page.filter_items($storage.items)}
                                    {@$page.gen_item($item)}
                                {/foreach}
                            {/content}
                        </div>
                    </div>
                {/hascontent}
                {assign storage_idx = $storage_idx + 1}
            {/foreach}
            {assign char_idx = $char_idx + 1}
        {/foreach}
    </div>
</div>
