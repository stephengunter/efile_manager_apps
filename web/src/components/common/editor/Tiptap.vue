
<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { DIALOG_MAX_WIDTH } from '@/config'
import { photoCustomTag, emojiCustomTag, deepClone } from '@/utils'

const name = 'EditorTiptap'
const props = defineProps({
   content: {
      type: String,
      default: ''
   },
	min_height: {
      type: String,
      default: '100px'
   },
})

const emit = defineEmits(['ready','changed','images'])

defineExpose({
   getContent, isEmpty
})

const initialState = {
	content: '',
	code: false,
	image: {
		active: false
	}
}
const state = reactive(deepClone(initialState))

const bubble = ref(null)

const editor = useEditor({
	content: '',
	autofocus: true,
	injectCSS: false,
	extensions: [
		StarterKit,
		Image,
		Underline,
		TextAlign.configure({
			types: ['heading', 'paragraph'],
		})
	],
	onUpdate({ editor }) {
		onChanged()
   },
})
onMounted(() => {
	window.addEventListener('mouseup', handleBubble)
	state.content = props.content
	editor.value.commands.setContent(state.content)
	
	emit('ready')
})

onBeforeUnmount(() => {
	editor.value.destroy()
	window.removeEventListener('mouseup', handleBubble)
})

function getContent() {
	if(state.code) {
		editor.value.commands.setContent(state.content)
	}else {
		state.content = editor.value.getHTML()
	}
	return state.content
}

function code() {
	if(state.code) {
		editor.value.commands.setContent(state.content)
	}else {
		state.content = editor.value.getHTML()
	}
	state.code = !state.code
}
function onEmojiSelected({ key, value }) {
	editor.value.commands.insertContent(emojiCustomTag({ key, value }))   
}
function image(val) {
	state.image.active = val
}
function onImageSelected(model) {
	editor.value.commands.insertContent(photoCustomTag(model))
	image(false)
	emit('images')
}

function handleBubble() {
	if(state.code) return
	var sel = window.getSelection()	
	if(sel && sel.toString().trim()) {
		var rect = sel.getRangeAt(0).getBoundingClientRect()
		let left = rect.left < 600 ? (rect.left + 30) : (rect.left - 360)
		let top = rect.top - 90
		bubble.value.style.left = `${left}px`
		bubble.value.style.top = `${top}px`
		bubble.value.style.display = 'block'
	}else {
		nextTick(() => {
			bubble.value.style.display = 'none'	
		})
	}
}
function cancel_bubble() {
	var sel = window.getSelection()// ? window.getSelection() : document.selection
	if(sel) sel.removeAllRanges()
	bubble.value.style.display = 'none'
}
function underline(active) {
	if(active) editor.value.chain().focus().unsetUnderline().run()
	else editor.value.chain().focus().setUnderline().run()
}
function isEmpty() {
	getContent()
	return editor.value.isEmpty
}
function onChanged() {
	emit('changed')
}
</script>

<template>
<div>
	<v-card v-if="editor" :min-height="min_height">
		<v-toolbar flat density="compact">
			<div>
				<v-btn icon="mdi-code-tags" @click.prevent="code" />
			</div>
			<div v-show="state.code === false">
				<v-btn icon="mdi-image" @click.prevent="image(true)" />
				<v-menu transition="scale-transition">
					<template v-slot:activator="{ props }">
						<v-btn icon="mdi-emoticon-outline"  v-bind="props"/>
					</template>
					<PickerEmoji @selected="onEmojiSelected" />
				</v-menu>
				<v-btn icon="mdi-undo" @click="editor.chain().focus().undo().run()" 
				:disabled="!editor.can().chain().focus().undo().run()" 
				/>
				<v-btn icon="mdi-redo" @click="editor.chain().focus().redo().run()" 
				:disabled="!editor.can().chain().focus().redo().run()"
				/>
				
			</div>
		</v-toolbar>
		<v-card-text>
			<v-textarea v-show="state.code" variant="outlined" auto-grow shaped
         rows="5" row-height="25"
			v-model="state.content" 
			@update:modelValue="onChanged"
         />
			<editor-content v-show="!state.code" :editor="editor" />
    	</v-card-text>
	</v-card>
	<v-dialog v-model="state.image.active" :width="DIALOG_MAX_WIDTH" persistent>
		<PickerImage 
		@cancel="image(false)" 
		@selected="onImageSelected" 
		/>
	</v-dialog>
	<div id="bubble" ref="bubble" class="custom-bubble">
		<v-toolbar v-if="editor" flat density="compact">
			<v-btn icon="mdi-format-bold" :active="editor.isActive('bold')" :disabled="!editor.can().chain().focus().toggleBold().run()"
			@click="editor.chain().focus().toggleBold().run()" 
			/>
			<v-btn icon="mdi-format-italic" :active="editor.isActive('italic')"  :disabled="!editor.can().chain().focus().toggleItalic().run()"
			@click="editor.chain().focus().toggleItalic().run()" 
			/>
			<v-btn icon="mdi-format-underline" :active="editor.isActive('underline')" 
			@click="underline(editor.isActive('underline'))" 
			/>
			<v-btn icon="mdi-format-strikethrough" :active="editor.isActive('strike')"  :disabled="!editor.can().chain().focus().toggleStrike().run()" 
			@click="editor.chain().focus().toggleStrike().run()" 
			/>
			<v-btn icon="mdi-format-align-left" :active="editor.isActive({ textAlign: 'left' })" :disabled="editor.isActive({ textAlign: 'left' })" 
			@click="editor.chain().focus().setTextAlign('left').run()"
			/>
			<v-btn icon="mdi-format-align-center" :active="editor.isActive({ textAlign: 'center' })" :disabled="editor.isActive({ textAlign: 'center' })" 
			@click="editor.chain().focus().setTextAlign('center').run()"
			/>
			<v-btn icon="mdi-format-align-right" :active="editor.isActive({ textAlign: 'right' })" :disabled="editor.isActive({ textAlign: 'right' })" 
			@click="editor.chain().focus().setTextAlign('right').run()"
			/>
			<v-spacer />
         <v-btn icon="mdi-window-close" variant="text" 
         @click.prevent="cancel_bubble"
         />
		</v-toolbar>
	</div>
</div>
  
</template>

<style lang="scss">
/* Basic editor styles */
.tiptap {
	> * + * {
		margin-top: 0.75em;
	}

	ul,
	ol {
		padding: 0 1rem;
	}

	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		line-height: 1.1;
	}

	code {
		background-color: rgba(#616161, 0.1);
		color: #616161;
	}

	pre {
		background: #0D0D0D;
		color: #FFF;
		font-family: 'JetBrainsMono', monospace;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;

		code {
			color: inherit;
			padding: 0;
			background: none;
			font-size: 0.8rem;
		}
	}

	img {
		max-width: 100%;
		height: auto;
	}

	blockquote {
		padding-left: 1rem;
		border-left: 2px solid rgba(#0D0D0D, 0.1);
	}

	hr {
		border: none;
		border-top: 2px solid rgba(#0D0D0D, 0.1);
		margin: 2rem 0;
	}
	img {
		max-width: 100%;
		height: auto;

		&.ProseMirror-selectednode {
			outline: 3px solid #68CEF8;
		}
	}
}
.custom-bubble {
	position: fixed;
	display: none;
	border: 1px solid;
	border-color: black;
	border-radius: 5px;
	background: #EEE;
	padding: 2px;
	white-space: pre;
}
</style>