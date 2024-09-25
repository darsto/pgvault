<div id="sort-menu">
    <div style="display: flex;">
        <div>
            Group by:
        </div>
        <div>
            <input type="radio" id="storages" name="group_by" value="storages"
                onclick="{serialize $page}.update_filters({@@ { sort_by_storage: true } @@})"
                {if $page.data.preferences.sort_by_storage}checked{/if} />
            <label for="storages">Storages</label>
        </div>
        <div>
            <input type="radio" id="characters" name="group_by" value="characters"
                onclick="{serialize $page}.update_filters({@@ { sort_by_storage: false } @@})"
                {if !$page.data.preferences.sort_by_storage}checked{/if} />
            <label for="characters">Characters</label>
        </div>
    </div>
</div>

{@@
<style>
#sort-menu {
    padding: 5px 8px;
    border: 1px solid #aaaaaa;
}

#sort-menu input,
#sort-menu label {
    cursor: pointer;
}
</style>
@@}
