<div id="context-menu" style="z-index: -200; visibility: hidden; pointer-events: none; top: 0;" onclick="event.stopPropagation()">
	{if $tpl}
		{@$tpl.run_raw($tpl_data || {\})}
	{else}
		{foreach entry of ($entries || [])}
			<div class="entry button {if !$entry.fn}disabled{/if}"
				onclick="{if $entry.fn}ContextMenu.close(); {serialize $entry}.fn(event);{/if}">
				{@$entry.name}
			</div>
		{/foreach}
	{/if}
</div>

{@@
<style>
#context-menu {
    position: absolute;
    text-align: left;
	display: flex;
	flex-direction: column;
	margin-top: -1px;
	width: max-content;
    background: #e1e1e1;
    color: black;
}

#context-menu > .entry {
	border-radius: 0;
	padding: 5px 6px;
}

#context-menu > .entry + .entry {
	margin-top: -1px;
}

#context-menu > .entry.disabled {
    font-style: italic;
    cursor: text;
    background: #e1e1e1;
    color: #777070;
}

</style>
@@}
