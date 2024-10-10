<div id="dir-filters">
    <div>Characters:</div>
    {foreach char of $characters.values()}
        <div>
            <label>
            <input type="checkbox" name="characters" value="{@$char.name}"
                onclick="{serialize $page}.on_dir_filter(this)"
                {if !$preferences.disabled_chars[$char.name]}checked{/if} />
                {@$char.name}
            </label>
        </div>
    {/for}
</div>

{@@
<style>
#dir-filters {
    padding: 5px 8px;
    border: 1px solid #aaaaaa;
}

#dir-filters input,
#dir-filters label {
    cursor: pointer;
}
</style>
@@}
