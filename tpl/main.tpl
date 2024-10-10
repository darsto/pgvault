<div class="frame">
    <div class="characters">
        {if !$using_reports_dir}
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
            <div class="button add" onclick="{serialize $page}.on_file_upload(event)"
                    title='Add a single .JSON report'>
                <span class="dots">
                    <i class="fa fa-plus"></i>
                </span>
            </div>
            <div class="button" onclick="{serialize $page}.on_link_directory(event)"
                    title='Add the whole "Reports" directory, so that new generated reports are automatically detected by PG Vault'>
                <span>Link directory</span>
                <span class="dots">
                    <i class="fa fa-folder"></i>
                </span>
            </div>
        {else}
            <div class="button remove" onclick="{serialize $page}.on_unlink_directory(event)"
                    title='Stop watching the "Reports" directory'>
                <span>Using directory: <b>Reports</b></span>
                <span class="dots">
                    <i class="fa fa-folder"></i>
                </span>
            </div>
            <div class="button" onclick="{serialize $page}.on_link_settings(this, event)">
                <span>Filters</span>
                <span class="dots">
                    <i class="fa fa-caret-down"></i>
                </span>
            </div>
        {/if}
    </div>

    <div class="search">
        <input autocomplete="off" type="text" class="search" placeholder="Item search..." value="{@$query}" oninput="{serialize $page}.search_oninput(this);">
        <div class="button" onclick="{serialize $page}.sort_onclick(this, event)">
            <span>Sort</span>
            <span class="dots">
                <i class="fa fa-caret-down"></i>
            </span>
        </div>
    </div>

    <div class="items">
        {assign char_idx = 0}
        {foreach char of $characters.values()}
            {foreach storage of $char.storages.values()}
                {if $storage.name?.startsWith("*AccountStorage_") && $char != $latest_char}
                    {continue}
                {/if}
                {if $storage.name.startsWith("*AccountStorage_")}
                    {assign char_str = '<span title="Taken from ' + $char.name + '\'s report">(Account Storage)</span>'}
                    {assign storage_str = $storage.name.substring("*AccountStorage_".length)}
                {else}
                    {assign char_str = $char.name}
                    {assign storage_str = $storage.name}
                {/if}

                <div class="container" data-pg-char-name="{@$char.name}" data-pg-name="{@$storage.name}">
                    <div class="header">
                        <span class="character">{@$char_str}</span>
                        <span class="name">{@$storage_str}</span>
                    </div>
                    <div class="body">
                        {foreach item of $page.filter_items($storage.items)}
                            {@$page.gen_item($item)}
                        {/foreach}
                    </div>
                </div>
            {/foreach}
            {assign char_idx = $char_idx + 1}
        {/foreach}
    </div>
</div>
