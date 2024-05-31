<template>
   <span v-html="html"></span>
</template>

<script>
import { highlightChunks } from '@/utils';
export default {
   props: {
      queries: {
         type: Array,
         default: null
      },
      content: {
         type: String,
         default: ''
      },
      case_sensitive: {
         type: Boolean,
         default: false
      },
   },
   data() {
      return {
         html: '',
      }
   },
   beforeMount() {
      this.init();
   },
   methods: {
      init() {
         let text = this.content;

         if(!text) {
            this.html = '';
            return;
         }
         let queries = this.queries;
         let caseSensitive = this.case_sensitive;
         let diacriticsSensitive = false;

         let highlights = highlightChunks(text, queries, { caseSensitive, diacriticsSensitive });
         
         this.render(highlights);
      },
      render(highlights) {
         
         let htmls = highlights.map(item => {
            if(item.isHighlighted) {
               return `<mark class="text__highlight">${item.text}</mark>`
            }else {
               return item.text;
            }
         });
        
         this.html = htmls.join('');
         
      }
   }
}
</script>