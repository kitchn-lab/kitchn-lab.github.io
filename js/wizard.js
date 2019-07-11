var formData = {},
    questionSets = $('.question__set');

/**
 * setup question sets
 */
questionSets.each(function() {
  var set = $(this),
      setHandle = set.data('name'),
      question = set.find('.question__title').text(),
      answers = set.find('.answer');

  // attach click events and handling to all answers
  answers.each(function() {
    var answerCta = $(this).find('.cta'),
        answer = answerCta.text();

    answerCta.on('click', function(event) {
      var showAlternateAnswer = answerCta.is('[toggle-alternate]') ? true : false;

      // show next question if we dont't have an alternate
      // answer input
      if (showAlternateAnswer) {
        set.find('.answers').fadeOut(150, function() {
          set.find('.alternate-answer').fadeIn(300);
        });
      } else {
        // push data to GTM
        pushDataLayer(
          set.attr('id') + "_" + setHandle,
          question,
          answer
        );

        if (setHandle == "question123") {
          if (answer == "No" || answer == "Nein") {
            skipNextSet(set);
          } else nextSet(set);
        } else {
          nextSet(set);
        }
      }

      // add answer to questionnaire data
      // which will be sent at the end of the form
      formData[setHandle] = answer;
    });
  });

  // if we have an alternate input
  // set that up too
  if (set.is('[has-alternate]')) {
    var alternate = set.find('.alternate-answer');

    alternate.on('submit', function(event) {
      answer = alternate.find('.input-text').val();
      formData[setHandle] = formData[setHandle] + ": " + answer;
      event.preventDefault();

      // push data to GTM
      pushDataLayer(
        setHandle,
        question,
        answer
      );

      nextSet(set);
    })
  }
});

/**
 * Setup form submit
 */
$('#questionnaire__form').on('submit', function(event) {
  event.preventDefault();

  var form = $(this),
      validationMsg = form.find('.validation-message'),
      email = $('#email').val()
      random_id = Math.random() * 100000000000000000,
      now = new Date();

  formData['email'] = email;
  formData['random_id'] = random_id;
  formData['time_log'] = now;

  console.log(formData);

  // validate input
  if (!validateEmail(email)) {
    validationMsg.show();
    return;
  }

  // Toggle button loading
  toggleLoadingButton(form);

  var posting = $.ajax({
    url: 'https://hooks.zapier.com/hooks/catch/1234567890',
    type: 'POST',
    data: formData
  });

  posting.done(function( data ) {
    // show the thank you screen
    nextSet(form.closest('.question__set'));

    if (typeof dataLayer != 'undefined') {
      dataLayer.push({
        'event': 'questionnaire_submit',
        'random_id': random_id
      });
    }
  });
})


/**
 * Helper functions
 */
function pushDataLayer (questionName, question, questionAnswer) {
  // check if GTM is loaded (will not load in dev env)
  if (typeof dataLayer != 'undefined') {
    dataLayer.push({
      'event': 'question_answered',
      'question_no': questionName,
      'question': question,
      'question_answer': questionAnswer
    });
  } else {
    // log stuff for debug
    console.log(questionName);
    console.log(question);
    console.log(questionAnswer);
  }
}

function nextSet(set) {
  // hide this set and show the next
  set.fadeOut(150, function() {
    set.next().fadeIn(300);
  });
}

function skipNextSet(set) {
  set.fadeOut(150, function() {
    set.next().next().fadeIn(300);
  });
}




/**
 * Helper functions
 */

function toggleLoadingButton(form) {
    form.find('button').toggleClass('loading');
  }
  
  function resetForm(form) {
    form.find('.input-text').val("");
    form.find('button').removeClass('loading');
  }
  
  var validateEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  
  var trackForm = function(email) {
    var data = { user_fields: {},tags: []};
  
    /* Get Query string params*/
    var vars = [], hash;
      var q = document.URL.split('?')[1];
      if(q != undefined){
        q = q.split('&');
        for(var i = 0; i < q.length; i++){
          hash = q[i].split('=');
          vars.push(hash[1]);
          vars[hash[0]] = hash[1];
        }
    }
    
    data.name = email;
  
    if (vars["ref"]){
      data.tags.push("referral");
      data.tags.push(vars["ref"]);
    }
  
    data.tags.push("Leads-from-website");
  
    return data;
  }
  
  $("a[rel~='keep-params']").click(function(e) {
    e.preventDefault();
  
    var params = window.location.search,
      dest = $(this).attr('href') + params;
  
    // Hack
    window.setTimeout(function() {
      window.location.href = dest;
    }, 100);
  });
  
  // hide validation message when the user
  // focusses the form
  $('[data-validate]').find('input').on('focus', function() {
    $('.validation-message').hide();
  })
  
  // hide parent container and toggle target from href
  $('.js__hideparent_toggle_target').on('click', function(event) {
    var target = $(this).attr('href');
  
    event.preventDefault();
  
    $(this).parent().hide();
    $(target).show();
  });
  