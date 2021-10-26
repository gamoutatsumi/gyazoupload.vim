if exists('g:loaded_gyazoupload') && g:loaded_ghosttext
  finish
endif
let g:loaded_gyazo = v:true

function s:upload(...) abort
  while !get(g:, 'gyazoupload#init', v:false)
    sleep 1m
  endwhile
  if a:0 > 0
    return denops#notify("gyazoupload", "upload", a:000)
  else
    return denops#notify("gyazoupload", "upload", [])
  endif
endfunction

command! -nargs=* -complete=file GyazoUpload call s:upload(<f-args>)

nnoremap <silent> <Plug>(gyazo-upload) :GyazoUpload<CR>

autocmd User DenopsPluginPost:gyazo let g:gyazoupload#init = v:true
