if exists('g:loaded_gyazoupload') && g:loaded_ghosttext
  finish
endif
let g:loaded_gyazo = v:true

function s:upload(...) abort
  call denops#plugin#wait('gyazoupload')
  if a:0 > 0
    return denops#notify("gyazoupload", "upload", a:000)
  else
    return denops#notify("gyazoupload", "upload", [])
  endif
endfunction

command! -nargs=* -complete=file GyazoUpload call s:upload(<f-args>)

nnoremap <silent> <Plug>(gyazo-upload) :GyazoUpload<CR>

autocmd User DenopsPluginPost:gyazoupload let g:gyazoupload#init = v:true
