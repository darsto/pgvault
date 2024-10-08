<div id="main">
	<div id="bg" onclick="{serialize $page}.close()"></div>
	<div id="frame-wrapper">
		<div id="frame">
			<div class="header">
				<span>What is it?</span>
				<span style="flex: 1"></span>
				<div class="close" onclick="{serialize $page}.close()">
					<i class="fa fa-times"></i>
				</div>
			</div>
			<span>
				PG Item Vault is a tool to list and search through items stored on any number of your characters in Project Gorgon.
			</span>
			<span>
				It can parse .json storage reports generated by Project Gorgon, which is a feature available to all VIP accounts.
			</span>
			<div style="align-self: center;">
				<img src="{@ROOT_URL}/images/pg_export_storage_ss.png">
			</div>
			<span>
				Once exported, click the "+" button on the website and select the reports. (You can select multiple at once.)<br>They're contained in<br>
				<b>%AppData%\\..\\LocalLow\\Elder Game\\Project Gorgon\\Reports</b><br>
				with a filename "&lt;charname&gt;_items_&lt;date&gt;.json".
			</span>
			<span>
				If you upload multiple reports for the same character, the newest one will always override any previous reports.
			</span>
			<span>
				Shared storage is included in every character's report. To avoid showing it multiple times, it will be shown only from the report with latest timestamp. Shared storage will be printed only once - it is assumed that all imported .json files come from a single account.
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
