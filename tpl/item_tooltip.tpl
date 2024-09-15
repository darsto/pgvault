<div id="item-tooltip" style="z-index: -200; visibility: hidden; pointer-events: none">
	{if $item}
		<div>{@$item.name || "Unnamed Item (?)"}</div>
		<div>MaxStackSize: {@$item_type.MaxStackSize}</div>
	{/if}
</div>

{@@
<style>
#item-tooltip {
    position: fixed;
    text-align: left;
	padding: 5px 8px;
	background: black;
}

</style>
@@}
