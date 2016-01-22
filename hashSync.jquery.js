
;(function($){
    
    "use strict";
    
    /* HashState class */
    
    window.HashState = function(key) {
        if(key) this.key = key;
        this.readHash();
    }
    
    var _hs = HashState.prototype;
    
    _hs.set = function(key, val, silent) {
        var del = val === '' || val === null || val === undefined;
        if(del) return this.del(key);
        this.data[key] = val;
        this.writeHash(silent);
        return this;
    }
    
    _hs.get = function(key) {
        return key ? this.data[key] : this.data;
    }
    
    _hs.del = function(key, silent){
        delete this.data[key];
        this.writeHash(silent);
        return this;
    }
    
    _hs.writeHash = function(silent){
        var i
        ,   h = []
        ;
        
        for(i in this.hash) {
            h[h.length] = i+'='+encodeURIComponent(JSON.stringify(this.hash[i]));
        }
        h.sort();
        h = h.join('&');
        if(silent) _hs.last_hash = '#' + h;
        
        location.hash = h;
        return this;
    }
    
    _hs.readHash = function() {
        var h = location.hash
        ,   o = get_url_vars(h, '#')
        ,   i
        ;
        
        for(i in o) {
            try {
                o[i] = JSON.parse(o[i]);
            }
            catch(e){
                
            }
        }
        this.hash = o;
        if(this.key) {
            if(!this.hash[this.key]) this.hash[this.key] = {};
            this.data = this.hash[this.key];
        }
        else {
            this.data = this.hash;
        }
        
        return this;
    }
    
    
    /* hashSync jQuery plugin */
    
    function hashSync(opts) {
        
        var $t = this
        ,   $i  = $t.find(':input:not(.hash-sync-disabled)')
        ,   _d = {
            hash: opts.hash || (new HashState())
          , last_hash: undefined
        }
        ;
        
        function inputChange(evt) {
            input2hash($(this));
        }
        
        $i.on('change', inputChange);
        
        function input2hash(e) {
            var n = e.attr('name')
            ,   v = e.val()
            ,   del
            ;
            if(!n) return false;
            if(e.is(':checkbox') && !e.prop('checked')) {
                del = true;
            }
            else if(!e.is(':radio')){
                del = v === '' || v === null || v === undefined;
            }
            
            if(del) {
                _d.hash.del(n, true);
            }
            else {
                _d.hash.set(n, v, true);
            }
        }
        
        function hash2input() {
            var i, inp, v
            ,   $e = $t.find(':input:not(.hash-sync-disabled)')
            ;
            $e.each(function(){
                var inp = $(this)
                ;
                
                v = inp.val();
                i = inp.attr('name');
                
                if(inp.is(':checkbox')) {
                    inp.prop('checked', !!_d.hash.get(i));
                    inp.trigger('change');
                }
                else if(inp.is(':radio')) {
                    inp.prop('checked', v == _d.hash.get(i));
                    if(v == _d.hash.get(i)) {
                        inp.trigger('change');
                    }
                }
                else {
                    if(v != _d.hash.get(i)) {
                        inp.val(_d.hash.get(i));
                        inp.trigger('change');
                    }
                }
            });
        }
        
        hash2input();
        
        $(window).on('hashchange', function(){
            if(location.hash !== _d.hash.last_hash) {
                _d.hash.readHash();
                hash2input();
            }
        });
    }
    
    $.fn.hashSync = hashSync;
    
})(jQuery);