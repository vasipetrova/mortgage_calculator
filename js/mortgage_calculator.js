(function ($) {

	/**
	* 
	*	Clear textfield value if value is the default value
	* 
	*/
	Drupal.behaviors.mortgage_calculatorClearInpuput = {
		attach: function (context, settings) {
			$('input').focusin( function(event){
				// Get the default value of the input field
				var defaultValue = $(this).prop("defaultValue");

				if($(this).val() == defaultValue)
					$(this).val("");			
			});   
		}
	};
	
	/**
	* 
	*	Reset textfield value to default if nothing is entered
	* 
	*/
	Drupal.behaviors.mortgage_calculatorResetInput = {
		attach: function (context, settings) {
			$('input').blur( function(event){
				// Get the default value of the input field			
				var defaultValue = $(this).prop("defaultValue");
				
				// If the input is empty set it to the devault value
				if($(this).val() == "")
					$(this).val(defaultValue);
					
					// If there is an error and the field is required
					if($(this).hasClass("error") && $(this).hasClass("required"))
					{
						// if the value is supposed to be a number
						if($(this).hasClass("numeric"))
						{
							// Remove the error if the numeric value is greater than 0
							if($(this).val() > 0)
							{
								// hide the errors
								$(this).removeClass("error");
								$(this).parent().next("div.numeric.error-message").html("").hide();
								
							}
						}

						// if the value is supposed to be a float
						if($(this).hasClass("percent"))
						{
							// Remove the error if the float value is greater than 0
							if(parseFloat($(this).val()) > 0)
							{
								// hide the errors							
								$(this).removeClass("error");
								$(this).parent().next("div.percent.error-message").html("").hide();
							}
						}
						
					}
			});   
		}
	};
	
	/**
	* 
	*	Allow numbers only (and special keys) for numeric fields.
	* 
	*/
	Drupal.behaviors.mortgage_calculatorNumbersOnly = {
		attach: function (context, settings) {
			$('input.numeric').keydown( function(event){
				var e = event || window.event;
				var key = e.charCode || e.keyCode || e.which || 0;

				// Allow: backspace, delete, tab, escape, and enter
				if ( key == 46 || 
						key == 8 || 
						key == 9 || 
						key == 27 || 
						key == 13 ||
					
				// Allow: Ctrl+A
				(key == 65 && e.ctrlKey === true) || 
			
				// Allow: home, end, left, right
				(key >= 35 && key <= 39)) 
				{
					return;
				}
				else 
				{
					// Ensure that it is a number and stop the keypress
					if (event.shiftKey || 
						(key < 48 || key > 57) && 
						(key < 96 || key > 105 )) 
					{
						if (e.preventDefault)
							e.preventDefault(); 
					}
				} 
			});   
		}
	};

	/**
	* 
	*	Allow numbers only (and special keys) to two decimal points.
	* 
	*/
	Drupal.behaviors.mortgage_calculatorPercentToTwoDecimals = {
		attach: function (context, settings) {
			$('input.percent').keydown( function(event){
				var e = event || window.event;
				var key = e.charCode || e.keyCode || e.which || 0;
				// get the input field's value
				var value = $(this).val();
				
				if (e.shiftKey == true)
				{
					if(e.preventDefault)
            e.preventDefault();
        }

				if ((e.keyCode >= 48 && e.keyCode <= 57) || 
						(e.keyCode >= 96 && e.keyCode <= 105) || 
						e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 37 ||
						e.keyCode == 39 || e.keyCode == 46 || e.keyCode == 190) 
				{
					if(value.indexOf('.') !== -1)
					{
						// Prevent the user from entering more than 2 decimal points
						var decimalPoints = value.length - (value.indexOf('.') + 1);
						if(decimalPoints >= 2)
						{
							if(e.preventDefault)
								e.preventDefault();        	
						}
	        }
        } 
        else 
        {
					if(e.preventDefault)        
	        	e.preventDefault();
        }

        //if a decimal has been added, disable the "." button
        if(value.indexOf('.') !== -1 && e.keyCode == 190)
        {
        		if(e.preventDefault)
	            e.preventDefault();
        }
			});	
		}
	};

	/**
	* 
	*	Calculate the monthly payment amount, yearly interest, principle amount and mortgage term in months
	* 
	*/	
  Drupal.mortgage_calculatorCalculate = function(purchasePrice, downPayment, mortgageTerm, interestRate) 
  {
  	// calculate the principle amount
    principleAmount = purchasePrice - downPayment;
    // calculate the annual interest rate
    yearlyInterestRate = (interestRate / 100) / 12;
    // calculate the mortgage term in months
    mortgageTermInMonths = mortgageTerm * 12;

    results = new Array();

    //	M = monthly payment
    //	P = principle amount
    //	N = mortgage term in months
    //	
    //  M = P * J / (((1 - (1 + J) ^ -N)) * 100) / 100)

    results['monthlyPayment'] = Math.floor((principleAmount * yearlyInterestRate) / (1 - Math.pow(1 + yearlyInterestRate, (-1 * mortgageTermInMonths))) * 100) / 100;
    results['principleAmount'] = principleAmount;
    results['mortgageTermInMonths'] = mortgageTermInMonths;

    return results;
  }
  
	Drupal.mortgage_calculatorCalculateClick = function(form)
	{
		var errorMessage = "";
		
		// Make sure the mortgage calculator price is not 0
		if($(form.mortgage_calculator_purchase_price).val() <= 0)
		{
			// set the input error
			$(form.mortgage_calculator_purchase_price).addClass("error");
			errorMessage = "The Price field can't be 0!";
      $(form.mortgage_calculator_purchase_price).focus();
      // show the error message
  		$(form.mortgage_calculator_purchase_price).parent().next("div.numeric.error-message").html(errorMessage).show();
  	}
  	else
  	{
  		$(form.mortgage_calculator_purchase_price).removeClass("error");
			$(form.mortgage_calculator_purchase_price).parent().next("div.numeric.error-message").html("").hide();  		
		}

		// Make sure the mortgage calculator interest rate is not 0
		if($(form.mortgage_calculator_interest_rate).val() <= 0)
		{
			// set the input error
			$(form.mortgage_calculator_interest_rate).addClass("error");
			errorMessage = "The interest rate field can't be 0!";
      $(form.mortgage_calculator_interest_rate).focus();
      // show the error message
  		$(form.mortgage_calculator_interest_rate).parent().next("div.percent.error-message").html(errorMessage).show();      
  	}
  	else
  	{
  		$(form.mortgage_calculator_interest_rate).removeClass("error");
			$(form.mortgage_calculator_interest_rate).parent().next("div.percent.error-message").html("").hide();  		
		}
  	
  	// If there are no error messages calculate the monthly payments
  	if(errorMessage == "")
  	{
  		var purchasePrice = parseInt($(form.mortgage_calculator_purchase_price).val());
  		var downPayment = parseInt($(form.mortgage_calculator_down_payment).val());
  		var mortgageTerm = parseInt($(form.mortgage_calculator_term).find('option:selected').val());
  		var interestRate = parseFloat($(form.mortgage_calculator_interest_rate).val());
  		
	  	var mortgageCalculations = Drupal.mortgage_calculatorCalculate(purchasePrice, downPayment, mortgageTerm, interestRate);
	  	var monthlyPayment = mortgageCalculations['monthlyPayment'];
	  	
	  	// Show the monthly payment
	  	$(form.mortgage_calculator_monthly_payment).val(monthlyPayment);
	  	$(form.mortgage_calculator_monthly_payment).addClass("highlight");
  	}
  	
  	// Calculate the monthly mortgage payments and amortization table
	}
	
	/**
	* 
	*	Register the button click for the calculate button
	* 
	*/	
	Drupal.behaviors.mortgage_calculatorRegisterCalculateClick = {
		attach: function (context, settings) {
			$('#mc-calculateBtn').mousedown( function(event) {
				// Register the onclick event for the mortgage calculator calculate button
				Drupal.mortgage_calculatorCalculateClick(this.form);
        return false;			
			});   
		}
	};	
}) (jQuery);