if exists('g:loaded_gyazo') && g:loaded_ghosttext
  finish
endif
let g:loaded_gyazo = v:true

function s:upload(...) abort
  while !get(g:, 'dps_gyazo#init', v:false)
    sleep 1m
  endwhile
  if a:0 > 0
    return denops#notify("gyazo", "upload", [a:1])
  else
    return denops#notify("gyazo", "upload", [])
  endif
endfunction

command! -nargs=* -complete=file GyazoUpload call s:upload(<f-args>)

nnoremap <silent> <Plug>(gyazo-upload) :GyazoUpload<CR>

autocmd User DenopsPluginPost:gyazo let g:dps_gyazo#init = v:true
