export const photoCustomTag = (model) => `<PHOTO>${JSON.stringify(model)}</PHOTO>`

export const emojiCustomTag = ({key, value}) => `<EMOJI>${key},${value}</EMOJI>`

export const matchPhotoes = (html) => html.match(/&lt;PHOTO&gt;(.*?)&lt;\/PHOTO&gt;/g)

export const resolveImageModel = (photo) => JSON.parse(photo.replace(/&lt;PHOTO&gt;/g, '').replace(/&lt;\/PHOTO&gt;/g, ''))

export const converEmoji = (html) => {
   let result = html  
   let matches = html.match(/&lt;EMOJI&gt;(.*?)&lt;\/EMOJI&gt;/g)
   if(!matches) return result

   matches.forEach(item => {
      let model = item.replace(/&lt;EMOJI&gt;/g, '').replace(/&lt;\/EMOJI&gt;/g, '').split(',')
      let block = `<span style="display: inline-block;" class="qqface-wrapper">
      <img src="/qqface.png" class="qqface qqface${model[1]}" >
      </span>
      `
      result = result.replace(item, block)  
   })
   return result
}