steal.plugins('jquery/class','jquery/lang','jquery/event/destroyed').then(function($){
//helpers
var bind = function(el, ev, callback){
	$(el).bind(ev, callback)
	return function(){
		$(el).unbind(ev, callback);
		el = ev = callback = null;
	}
}
var delegate = function(el, selector, ev, callback){
	$(el).delegate(selector, ev, callback)
	return function(){
		$(el).undelegate(selector, ev, callback);
		el = ev = callback = selector = null;
	}
}
//wraps 'this' and makes it the first argument
var shifter = function(cb){ 
	return function(){
		cb.apply(null, [$(this)].concat(Array.prototype.slice.call(arguments, 0)))
	}
}
/**
 * @tag core
 * @plugin jquery/controllers
 * Controllers organize event handlers using event delegation. 
 * If something happens in your application (a user click or a [jQuery.Model|Model] instance being updated), 
 * a controller should respond to it. 
 * <h3>Benefits</h3>
 * <ul>
 *     <li><p><i>Know your code.</i></p>
 *     		Group events and label your html in repeatable ways so it's easy to find your code.</li>
 *     <li><p><i>Controllers are inheritable.</i></p>
 *         Package, inherit, and reuse your widgets.</li>
 *     <li><p><i>Write less.</i></p>
 *         Controllers take care of setup / teardown automatically.</li>
 * </ul>
 * <h3>Example</h3>
 * @codestart
//Instead of:
$(function(){
  $('#tabs').click(someCallbackFunction1)
  $('#tabs .tab').click(someCallbackFunction2)
  $('#tabs .delete click').click(someCallbackFunction3)
});

//do this
$.Controller.extend('Tabs',{
  click: function(){...},
  '.tab click' : function(){...},
  '.delete click' : function(){...}
})
$('#tabs').tabs();
@codeend
 * <h2>Using Controllers</h2>
 * <p>A Controller is just a list of functions that get called back when the appropriate event happens.  
 * The name of the function provides a description of when the function should be called.  By naming your functions in the correct way,
 * Controller recognizes them as an <b>Action</b> and hook them up in the correct way.</p>
 * 
 * <p>The 'hook up' happens when you create a [jQuery.Controller.prototype.setup|new controller instance].</p>
 * 
 * <p>Lets look at a very basic example.  
 * Lets say you have a list of todos and a button you want to click to create more.
 * Your HTML might look like:</p>
@codestart html
&lt;div id='todos'>
	&lt;ol>
	  &lt;li class="todo">Laundry&lt;/li>
	  &lt;li class="todo">Dishes&lt;/li>
	  &lt;li class="todo">Walk Dog&lt;/li>
	&lt;/ol>
	&lt;a id="create_todo">Create&lt;/a>
&lt;/div>
@codeend
To add a mousover effect and create todos, your controller class might look like:
@codestart
$.Controller.extend('TodosController',{
  ".todo mouseover" : function(el, ev){
	  el.css("backgroundColor","red")
  },
  ".todo mouseout" : function(el, ev){
	  el.css("backgroundColor","")
  },
  "#create_todo click" : function(){
	  this.find("ol").append("&lt;li class='todo'>New Todo&lt;/li>"); 
  }
})
@codeend
Now that you've created the controller class, you've got attach the event handlers on the '#todos' div by
creating [jQuery.Controller.prototype.init|a new controller instance].  There are 2 ways of doing this.
@codestart
//1. Create a new controller directly:
new TodosController($('#todos')[0]);
//2. Use jQuery function
$('#todos').todos_controller();
@codeend

As you've likely noticed, when the [jQuery.Controller.static.init|controller class is created], it creates helper
functions on [jQuery.fn]. The "#todos" element is known as the <b>delegated</b> element.

<h3>Action Types</h3>
<p>Controller uses actions to match function names and attach events.  
By default, Controller will match [jQuery.Controller.Action.Event|Event] and [jQuery.Controller.Action.Subscribe|Subscribe] actions. 
To match other actions, steal their plugins.</p>
<table>
	<tr>
		<th>Action</th><th>Events</th><th>Example</th><th>Description</th>
	</tr>
	<tbody  style="font-size: 11px;">
	<tr>
		<td>[jQuery.Controller.Action.Event Event]</td>
		<td>change click contextmenu dblclick keydown keyup keypress mousedown mousemove mouseout mouseover mouseup reset 
			windowresize resize windowscroll scroll select submit dblclick focus blur load unload ready hashchange</td>
		<td>"a.destroy click"</td>
		<td>Matches standard DOM events</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Subscribe Subscribe]</td>
		<td>Any <a href="http://www.openajax.org/index.php">openajax</a> event</td>
		<td>"todos.*.create subscribe"</td>
		<td>Subscribes this action to OpenAjax hub.</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Drag Drag]</td>
		<td>draginit dragend dragmove</td>
		<td>".handle draginit"</td>
		<td>Matches events on a dragged object</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Drop Drop]</td>
		<td>dropover dropon dropout dropinit dropmove dropend</td>
		<td>".droparea dropon"</td>
		<td>Matches events on a droppable object</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Lasso Lasso]</td>
		<td>lassoinit lassoend lassomove</td>
		<td>"#lassoarea lassomove"</td>
		<td>Allows you to lasso elements.</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Selectable Selectable]</td>
		<td>selectover selected selectout selectinit selectmove selectend</td>
		<td>".selectable selected"</td>
		<td>Matches events on elements that can be selected by the lasso.</td>
	</tr>
	</tbody>
</table>

<h3>Callback Parameters</h3>
For most actions, the first two parameters are always:
<ul>
	<li>el - the jQuery wrapped element.</li>
	<li>ev - the jQuery wrapped DOM event.</li>
</ul>
@codestart
".something click" : function(el, ev){
   el.slideUp()
   ev.stopDelegation();  //stops this event from delegating to any other
						 // delegated events for this delegated element.
   ev.preventDefault();  //prevents the default action from happening.
   ev.stopPropagation(); //stops the event from going to other elements.
}
@codeend

If the action provides different parameters, they are in each action's documentation.


<h2>onDocument Controllers</h2>
<p>Sometimes, you want your controllers to delegate from the document or documentElement.  Typically this is
done in less complex applications where you know there will only be a single instance of the controller
on the page.</p>
<p>The advantage of onDocument Controllers is that they can be automatically attached to the document for you.</p>
To automatically attach to the document, add "onDocument: true" to your controller as follows:
@codestart
$.Controller.extend('TodosController',
{onDocument: true},
{
  ".todo mouseover" : function(el, ev){
	  el.css("backgroundColor","red")
  },
  ".todo mouseout" : function(el, ev){
	  el.css("backgroundColor","")
  },
  "#create_todo click" : function(){
	  this.find("ol").append("&lt;li class='todo'>New Todo&lt;/li>"); 
  }
})
@codeend

 */
jQuery.Class.extend("jQuery.Controller",
/* @Static*/
{
	/**
	 * Does 2 things:
	 * <ol>
	 *     <li>Creates a jQuery helper for this controller</li>
	 *     <li> and attaches this element to the documentElement if onDocument is true</li>
	 * </ol>   
	 * <h3>jQuery Helper Naming Examples</h3>
	 * @codestart
	 * "TaskController" -> $().task_controller()
	 * "Controllers.Task" -> $().controllers_task()
	 * @codeend
	 */
	init : function(){
		if(!this.shortName  || this.fullName == "jQuery.Controller") return;
		this.underscoreFullName = $.String.underscore(this.fullName.replace(/\./g,'_').replace(/_?controllers?/i,""));
		this.underscoreShortName = $.String.underscore(this.shortName.replace(/\./g,'_').replace(/_?controllers?/i,""));
		this.underscoreControllerName = this.shortName.replace(/\./g,'_').replace(/_?controllers?/i,"");
		
		var val, act;
		//if(!this.modelName)
		//    this.modelName = jQuery.String.isSingular(this.underscoreName) ? this.underscoreName : jQuery.String.singularize(this.underscoreName)

		//if(steal.getPath().match(/(.*?)controllers/)){
		//    this._path = steal.getPath().match(/(.*?)controllers/)[1]+"controllers";
		//}else{
		//    this._path = steal.getPath()+"/"
		//}
		
		var controller = this;
		
		

		 
		 
		 var pluginname = this.underscoreFullName;
		 if(!jQuery.fn[pluginname]) {
			jQuery.fn[pluginname] = function(options){
				var args = $.makeArray(arguments), 
					isMethod = typeof options == "string" && typeof controller.prototype[options] == "function",
					meth = args[0],
					allCreated = true;;
				this.each(function(){
				//check if created
					var controllers = jQuery.data(this,"controllers"),
						plugin = controllers && controllers[pluginname];
					
					
					if(plugin){
						if(isMethod)
							plugin[meth].apply(plugin, args.slice(1))
						else if(plugin.update)
							plugin.update.apply(plugin, args)
					}else{
						allCreated = false;
						controller.newInstance.apply(controller, [this].concat(args))
					}
				})
				return this;
			}
			
		 }
		
		//calculate actions
		this.actions = {};
		var convertedName, act, parts, c = this, replacer = /\{([^\}]+)\}/g, b = c.breaker;
		for (funcName in this.prototype) {
			if(funcName == "constructor") continue;
			convertedName = funcName.replace(replacer, function(whole, inside){
				//convert inside to type
				return jQuery.Class.getObject(inside, c.OPTIONS).toString()
			})
			parts = convertedName.match( b)
			act = parts && ( c.processors[parts[2]] || ($.inArray(parts[2], c.listensTo ) > -1 && c.basicProcessor) || ( parts[1] && c.basicProcessor) );
			if(act){
				this.actions[funcName] = {action: act, parts: parts}
			}
		}
		
		/**
		 * @attribute onDocument
		 * Set to true if you want to automatically attach this element to the documentElement.
		 */
		if(this.onDocument)
			new this(document.documentElement);
		
		this.hookup = function(el){
			return new c(el);
		}
	},
	breaker : /^(?:(.*?)\s)?([\w\.]+)$/,
	listensTo : []//

	//actions : [] //list of action types
},
/* @Prototype */
{
	/**
	 * Does three things:
	 * <ol>
	 *     <li>Matches and creates actions.</li>
	 *     <li>Set the controller's element.</li>
	 *     <li>Saves a reference to this controller in the element's data.</li>
	 * </ol>  
	 * @param {HTMLElement} element the element this instance operates on.
	 */
	setup: function(element, options){
		var funcName, convertedName, func, a, act, c = this.Class, b = c.breaker, cb;
		element = element.jquery ? element[0] : element;
		//needs to go through prototype, and attach events to this instance
		this.element = jQuery(element).addClass(this.Class.underscoreFullName );
		
		//$.data(element,this.Class.underscoreFullName, this)
		( jQuery.data(element,"controllers") || jQuery.data(element,"controllers",{}) )[this.Class.underscoreFullName] = this;
		
		this._bindings = [];
		for(funcName in c.actions){
			var ready = c.actions[funcName]
			cb = this.callback(funcName)
			this._bindings.push( ready.action(element, ready.parts[2], ready.parts[1], cb, this) )
		}
		 

		/**
		 * @attribute called
		 * String name of current function being called on controller instance.  This is 
		 * used for picking the right view in render.
		 * @hide
		 */
		this.called = "init";
		/**
		 * @attribute options
		 * Options is automatically merged from this.Class.OPTIONS and the 2nd argument
		 * passed to a controller.
		 */
		this.options = $.extend( $.extend(true,{}, this.Class.OPTIONS  ), options)
		//setup to be destroyed ... don't bind b/c we don't want to remove it
		this.element.bind('destroyed', this.callback('destroy'))
		//this.bind('destroyed', 'destroy')
		/**
		 * @attribute element
		 * The controller instance's delegated element.  This is set by [jQuery.Controller.prototype.init init].
		 * It is a jQuery wrapped element.
		 * @codestart
		 * ".something click" : function(){
		 *    this.element.css("color","red")
		 * }
		 * @codeend
		 */
		return this.element;
	},
	/**
	 * Bind attaches event handlers that will be released whent he widget is destroyed.
	 * <br/>
	 * Examples:
	 * @codestart
	 * // calls somethingClicked(el,ev)
	 * this.bind('click','somethingClicked') 
	 * 
	 * // calls function when the window si clicked
	 * this.bind(window, 'click', function(){
	 *   //do something
	 * })
	 * @codeend
	 * @param {HTMLElement} [el=this.element] 
	 * @param {String} eventName
	 * @param {Function_String} func A callback function or the name of a function on "this".
	 * @return {Integer} The id of the binding in this._bindings
	 */
	bind : function(el, eventName, func){
		if(typeof el == 'string'){
			func = eventName;
			eventName = el;
			el = this.element
		}
		if(typeof func == 'string'){
			func = shifter(this.callback(func))
		}
		this._bindings.push( bind(el, eventName, func ) )
		return this._bindings.length;
	},
	update : function(options){
		$.extend(this.options, options)
	},
	/**
	 * Removes all actions on this instance.
	 */
	destroy: function(){
		if(this._destroyed) throw this.Class.shortName+" controller instance has already been deleted";
		
		var self = this;
		jQuery.each(this._bindings, function(key, value){
			if(typeof value == "function") value(self.element[0]);
		});
		
		delete this._actions;
		this._destroyed = true;
		//clear element

		var controllers = this.element.data("controllers");
		if(controllers && controllers[this.Class.underscoreFullName])
			delete controllers[this.Class.underscoreFullName];
		
		this.element = null;
	},
	/**
	 * Queries from the controller's delegated element.
	 * @codestart
	 * ".destroy_all click" : function(){
	 *    this.find(".todos").remove();
	 * }
	 * @codeend
	 * @param {String} selector selection string
	 */
	find: function(selector){
		return this.element.find(selector);
	},
	/**
	 * Publishes a message to OpenAjax.hub.
	 * @param {String} message Message name, ex: "Something.Happened".
	 * @param {Object} data The data sent.
	 */
	publish: function(){
		OpenAjax.hub.publish.apply(OpenAjax.hub, arguments);
	},
	//tells callback to set called on this.  I hate this.
	_set_called : true,
	init : function(){}
});


//lets add the processors :


jQuery.Controller.processors = {};
var basic = (jQuery.Controller.basicProcessor =function(el, event, selector, cb, controller){
	if(controller.onDocument){ //prepend underscore name if necessary
		selector = selector ? controller.underscoreShortName +" "+selector : controller.underscoreShortName
	}
	if(selector){
		return delegate(el, selector, event, shifter(cb))
	}else{
		return bind(el, event, shifter(cb))
	}
})
jQuery.each(["change","click","contextmenu","dblclick","keydown","keyup","keypress","mousedown","mousemove","mouseout","mouseover","mouseup","reset","windowresize","resize","windowscroll","scroll","select","submit","dblclick","focusin","focusout","load","unload","ready","hashchange"], function(i ,v){
	jQuery.Controller.processors[v] = basic;
})
var windowEvent = function(el, event, selector, cb){
	var func = function(){ return cb.apply(null, [jQuery(this)].concat( Array.prototype.slice.call(arguments, 0) )) }
	jQuery(window).bind(event.replace(/window/,""), func);
	return function(){
	    jQuery(el).unbind(event.replace(/window/,""), func);
	}
}

jQuery.each(["windowresize","windowscroll","load"], function(i ,v){
	jQuery.Controller.processors[v] = windowEvent;
})


$.fn.mixin = function(){
	//create a bunch of controllers
	var controllers = $.makeArray(arguments);
	return this.each(function(){
		for(var i = 0 ; i < controllers.length; i++){
			new controllers[i](this)
		}
		
	})
}
jQuery.fn.controllers = function(){
    var controllerNames = jQuery.Array.from(arguments), 
	   instances = [], 
	   controllers, 
	   cname;
    //check if arguments
	this.each(function(){
		controllers= jQuery.data(this, "controllers")
		if(!controllers) return;
		for(var cname in controllers){
			instances.push(controllers[cname])
		}
	})
	return instances;
};
jQuery.fn.controller = function(){
	return this.controllers.apply(this, arguments)[0];
};

})