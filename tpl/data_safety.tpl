<div id="main">
	<div id="bg" onclick="{serialize $page}.close()"></div>
	<div id="frame-wrapper">
		<div id="frame">
			<div class="header">
				<span>About data safety</span>
				<span style="flex: 1"></span>
				<div class="close" onclick="{serialize $page}.close()">
					<i class="fa fa-times"></i>
				</div>
			</div>
			<span>
				All .json files uploaded to this site are stored in browser memory, and never sent to any server. They're processed entirely on your computer.
			</span>
			<span>
				Item icons and item data are fetched from PG servers, then stored in browser memory for further reuse.
			</span>
		</div>
	</div>
</div>
{@@
<style>
#main,
#bg {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}

#main {
	background: rgba(0, 0, 0, 70%);
	overflow-y: scroll;
}

#frame-wrapper {
    position: absolute;
	top: 50px;
	left: 50%;
    transform: translateX(-50%);
	padding-bottom: 50px;
}

#frame {
    padding: 9px 12px 20px 12px;
	background: black;
	border: 2px solid #372a2a;
	width: 750px;
	max-width: calc(100% - 20px);
	display: flex;
	flex-direction: column;
	gap: 10px;
}


#frame > .header {
	display: flex;
	font-size: 16px;
	font-weight: bold;
	align-items: center;
	/* make room for the X-button padding */
    margin: -9px -12px;
	padding: 9px 12px;
}

#frame > .header > .close {
    width: 40px;
    text-align: center;
	font-size: 20px;
    margin: -9px -12px;
	padding: 9px 12px;
	cursor: pointer;
}

img {
	max-width: 100%;
	height: auto;
}
</style>
@@}
