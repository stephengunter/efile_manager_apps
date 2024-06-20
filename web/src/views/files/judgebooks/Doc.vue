<script setup>
import { MqResponsive } from 'vue3-mq'
import { ref, reactive, computed, watch, onBeforeMount, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { SHOW_PHOTO } from '@/store/actions.type'
import { SET_ERRORS, CLEAR_ERRORS, SET_JUDGEBOOKFILES_PARAMS } from '@/store/mutations.type'
import { isEmptyObject, deepClone , downloadFile } from '@/utils'
import { UPLOAD_PATH } from '@/config'
import { WIDTH, ENTITY_TYPES } from '@/consts'

const name = 'FilesJudgebooksDocView'
const store = useStore()
const route = useRoute()
const router = useRouter()

const ENTITY_TYPE = ENTITY_TYPES.JUDGEBOOKFILE

const initialState = {
	title: '使用說明',
	content: `<h2>權限</h2>
					<p>
						
						<table>
							<tr>
								<th></th>
								<th>錄事</th>
								<th>
									書記官
								</th>
								<th>
									紀錄科長
								</th>
								<th>
									檔案室
								</th>
							</tr>
							<tr>
								<th>股別</th>
								<td>
									所屬股
								</td>
								<td >
									所屬股
								</td>
								<td >
									全部
								</td>
								<td >
									全部
								</td>
							</tr>
							<tr>
								<th>操作</th>
								<td>
									<ul style="padding-left: 15px;">
										<li>
											上傳(限所屬股，股別不可空白)
										</li>
										<li>
											修改(自己上傳AND未審核)
										</li>
										<li>
											下載(自己上傳AND未審核)
										</li>
									</ul>
									
								</td>
								<td>
									<ul style="padding-left: 15px;">
										<li>
											上傳(限所屬股，股別不可空白)
										</li>
										<li>
											修改(自己上傳AND未審核)
										</li>
										<li>
											下載(自己上傳AND未審核)
										</li>
									</ul>
									
								</td>
								<td>
									<ul style="padding-left: 15px;">
										<li>
											上傳(全部股別，股別可以空白)
										</li>
										<li>
											修改(所有未審核案件，可以修改股別)
										</li>
										<li>
											下載(所有未審核案件)
										</li>
									</ul>
									
								</td>
								<td>
									<ul style="padding-left: 15px;">
										<li>
											上傳(全部股別，股別可以空白)
										</li>
										<li>
											修改(所有案件，可以修改股別)
										</li>
										<li>
											審核(所有未審核案件，需要檔案號)
										</li>
										<li>
											下載(所有案件)
										</li>
										<li>
											列印報表
										</li>
									</ul>
									
								</td>
							</tr>
						</table>
					</p>
					<h2>首頁</h2>
					<p>
						<UPLOAD_IMAGE>index_head.png</UPLOAD_IMAGE>
						<UPLOAD_IMAGE>menu.png</UPLOAD_IMAGE>
					</p>
					<h2>上傳</h2>
					<p>
						<UPLOAD_IMAGE>upload_a.png</UPLOAD_IMAGE>
						<UPLOAD_IMAGE>upload_b.png</UPLOAD_IMAGE>
					</p>
					<h2>修改</h2>
					<p>
						<UPLOAD_IMAGE>update.png</UPLOAD_IMAGE>
					</p>
					<h2>審核(檔案室)</h2>
					<p>
						<UPLOAD_IMAGE>review_a.png</UPLOAD_IMAGE>
						<UPLOAD_IMAGE>review_b.png</UPLOAD_IMAGE>
					</p>`
}


const state = reactive(deepClone(initialState))
const isAdmin = computed(() => store.state.files_judgebooks.isAdmin)
onBeforeMount(() => {
	state.content = convertUploadImages(state.content)
})
function convertUploadImages(html) {
	let matches = html.match(/<UPLOAD_IMAGE>(.*?)<\/UPLOAD_IMAGE>/g)
	if (!matches) return html

	matches.forEach(match => {
		let imagePath = match.replace(/<\/?UPLOAD_IMAGE>/g, '').trim()
		let imgTag = `<img class="thumbnail" src="${UPLOAD_PATH}/${imagePath}" alt="" onclick="${SHOW_PHOTO}('${UPLOAD_PATH}/${imagePath}')">`
		html = html.replace(match, imgTag)
	})
	return html
}

</script>

<template>
	<div>
		<v-row>
			<v-col cols="12">
				<p class="text-h5">
					{{ state.title }}
				</p>
			</v-col>
		</v-row>	
		<v-row>
			<v-col cols="12">
				<article v-html="state.content" style="font-size: 1.2rem;">
				</article>
			</v-col>
		</v-row>
		<v-row v-if="isAdmin">
			<v-col cols="12">
				<article style="font-size: 1.2rem;">
				
					<p class="text-h5 pb-3">
						系統面的說明(以下內容只有資訊室可見)
					</p>
					<h2>權限</h2>
					<p>
						
						<table style="width: 480px;">
							<tr>
								<th></th>
								
								<th>
									資訊室
								</th>
							</tr>
							<tr>
								<th>股別</th>
								<td >
									全部
								</td>
							</tr>
							<tr>
								<th>操作</th>
								
								<td>
									<ul style="padding-left: 15px;">
										<li>
											上傳(全部股別，股別可以空白)
										</li>
										<li>
											下載(自己上傳AND未審核)
										</li>
										<li>
											修改(自己上傳AND未審核)
										</li>
										<li>
											列印報表
										</li>
										
									</ul>
									
								</td>
							</tr>
						</table>
					</p>
					<h2>網站運行</h2>
					<p>
						<ul class="pl-5">
							<li>
								網站和資料庫放在172.17.129.56
							</li>
							<li>
								網站名稱 efile_manager， 資料庫名稱 efile_manager
							</li>
						</ul>
						
					</p>
					<h2>檔案的存儲</h2>
					<p>
						<ul class="pl-5">
							<li>
								放在NAS 172.17.130.64，資料夾 efile_manager/files
							</li>
						</ul>
						<img class="thumbnail" :src="`${UPLOAD_PATH}/store_tree.png`" alt="" :onclick="`${SHOW_PHOTO}('${UPLOAD_PATH}/store_tree.png')`">
					</p>
					<h2>待完成的事項</h2>
					<p>
						用戶端：
						<ul class="pl-5">
							<li>
								檔案號的檢核規則(需要檔案室提供規則)
							</li>
							<li>
								報表的使用與輸出(待檔案室有想法後提供意見)
							</li>
						</ul>
						系統端：
						<ul class="pl-5">
							<li>
								資料庫的備份機制(預計7月底前完成)
							</li>
							<li>
								檔案(pdf)的備份機制(預計8月底前完成)
							</li>
						</ul>
					</p>
				</article>
			</v-col>
		</v-row>
	</div>
</template>