
;(function($){
    
    "use strict";
    
    /* HashState class */
    
    window.HashState = function(key) {
        if(key) this.key = key;
        this.readHash();
    }
    
    var _hs = HashState.prototype;
    
    _hs.set = function(key, val) {
        this.data[key] = val;
        this.writeHash();
        return this;
    }
    
    _hs.get = function(key) {
        return this.data[key];
    }
    
    _hs.writeHash = function(){
        var i
        ,   h = []
        ;
        
        for(i in this.hash) {
            h[h.length] = i+'='+JSON.stringify(this.hash[i]);
        }
        h.sort();
        h = h.join('&');
        
        _hs.last_hash = '#' + h;
        
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
    
    _hs.del = function(key){
        delete this.data[key];
        this.writeHash();
        return this;
    }
    
    
    /* hashSync jQuery plugin */
    
    function hashSync(opts) {
        
        var $t = this
        ,   $i  = $t.find(':input:not(.hash-sync-disabled)')
        ,   _d = {
            hash: new HashState(opts.name)
          , last_hash: undefined
        }
        ;
        
        function inputChange(evt) {
            input2hash($(this));
            // if() {
                // v2obj(e.attr('name'), false);
            // }
            // else {
                // v2obj(e.attr('name'), e.val());
            // }
        }
        
        $i.on('change', inputChange);
        
        function input2hash(e) {
            var n = e.attr('name')
            ,   v = e.val()
            ,   del
            ;
            
            if(e.is(':checkbox') && !e.prop('checked')) {
                del = true;
            }
            else if(!e.is(':radio')){
                del = v === '' || v === null || v === undefined;
            }
            
            if(del) {
                _d.hash.del(n);
            }
            else {
                _d.hash.set(n, v);
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