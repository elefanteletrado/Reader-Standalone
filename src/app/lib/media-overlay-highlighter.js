MOHighlighter = Backbone.View.extend({
  lastid: null,
  activeClass: '-epub-media-overlay-active',
  doneHighlighting: false,

  initialize: function (settings) {
    var self = this;
    if (settings.activeClass !== undefined && settings.activeClass !== '') {
      this.activeClass = settings.activeClass;
    }
    this.model.bind('change:current_text_element_id', function () {
      self.highlight()
    });

    // if audio is done, so is highlighting
    this.model.bind('change:is_document_done', function () {
        if (self.model.get("is_document_done")) {
            if (self.doneHighlighting === false) {
                self.doneHighlighting = true;
                self.model.set({
                    is_highlighting_done: self.doneHighlighting
                });
            }
        }
    });
  },

  // highlight the new ID and unhighlight the old one
  // annoyingly, using removeClass to unhighlight wasn't working in iframes
  // so rather than leave everything highlighted, we'll just make sure it's in view
  highlight: function () {
    var id = this.model.get("current_text_element_id");
    if (this.model.get("should_highlight")) {
      var selector;
      if (this.lastid != null) {
        // undo the background color change
        selector = "#" + this.lastid;
        var lastelm = this.$(selector);

        lastelm.removeClass(this.activeClass);

      }
      selector = "#" + id;
      var elm = this.$(selector);

      if (elm.length > 0) {
        this.lastid = id;
        elm.addClass(this.activeClass);

        // if this is the last element to highlight and it is empty, consider highlighting done
        this.doneHighlighting = this.model.get("current_is_last_child") === true && $.trim(elm.html()) === '';
        this.model.set({
            is_highlighting_done: this.doneHighlighting
        });
        
      }
    }
  }
});