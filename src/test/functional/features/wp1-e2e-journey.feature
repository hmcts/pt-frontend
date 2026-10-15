@e2e @wp1 @JIRA-IGNORE
Feature: Work package 1 end-to-end journey
  As a citizen
  I want to complete an open market rent determination from triage through to the task list
  So that I can prepare an application to challenge a landlord's notice

  # Happy path from the Figma journey: start a new application for yourself,
  # an in-rollout English postcode, a landlord who is not a housing association,
  # sole tenant, then challenge a section 13 notice on an assured periodic tenancy.
  # Conditional branches (representative, joint tenant, housing association, letting agent)
  # stay in the individual page tests.

  Scenario: Citizen completes the work package 1 application journey
    # Triage
    Given the citizen is on the Starting Or Returning Application page
    When the citizen selects start a new application
    Then the citizen is taken to the apply for yourself or someone else page
    When the citizen selects applying for myself
    And the citizen clicks Continue
    Then the citizen is taken to the postcode triage page
    When I enter "B1 1BH" for the question "What is the address of the property you are applying about?"
    And I click "Continue"
    Then the page should include "Is your landlord a housing association?"
    When I select "No" for the question "Is your landlord a housing association?"
    And I click "Continue"
    Then the page should include "Which application do you want to make?"
    When I select "Open market rent determination application" for the question "Which application do you want to make?"
    And I click "Continue"
    Then the page should include "Are you a tenant or joint tenant?"
    When I select "Tenant" for the question "Are you a tenant or joint tenant?"
    And I click "Continue"
    Then the page should include "Sign in or create an account"

    # Sign in and open the case
    When the user enters their credentials successfully
    Then the user will be redirected back to the PT UI
    When user clicks on the my application link
    Then check that the user is redirected to the application-type page
    When I select the option "Challenge the rent increase proposed in a landlord's notice proposing a new rent"
    And I click "Continue"
    Then check that the user is redirected to the "tenancy-type" page
    When I select the option "Assured periodic tenancy"
    And I click "Continue"
    Then check that the user is redirected to the task-list citizen dashboard page

    # Application type is already answered and shown as a summary
    When I click "Application type"
    Then the page should include "Challenge the rent increase proposed in a landlord's notice proposing a new rent"
    And the page should include "Assured periodic tenancy"
    When I click "Back"
    Then check that the user is redirected to the task-list citizen dashboard page

    # Contact preferences
    When I click "Contact preferences"
    Then the page should include "Do you want to receive text updates?"
    When I select "No, I want to receive email updates only" for the question "Do you want to receive text updates?"
    And I click "Save and continue"
    Then the page should include "Enter a phone number for phone calls (optional)"
    When I enter "07394121492" for the question "Enter a phone number for phone calls (optional)"
    And I click "Save and continue"
    Then the page should include "Check your answers"
    When I click "Complete this section"
    Then check that the user is redirected to the task-list citizen dashboard page

    # Tenant details
    When I click "Who is on the tenancy"
    Then the page should include "Your information"
    When I enter "Mark" for the question "First name"
    And I enter "Brown" for the question "Last name"
    And I click "Save and continue"
    Then the page should include "Check your answers - Tenant details (placeholder)"
    When the citizen returns to the task list
    Then check that the user is redirected to the task-list citizen dashboard page

    # Landlord details. The name screen is a placeholder until the name and landlord type change is built.
    When I click "Landlord details including any representatives"
    Then the page should include "Landlord name"
    When I click "Save and continue"
    Then the page should include "What is your landlord's email address?"
    When I enter "jo@malone.com" for the question "What is your landlord's email address?"
    And I click "Save and continue"
    Then the page should include "What is your landlord's phone number? (optional)"
    When I click "Save and continue"
    Then the page should include "Does your landlord have a letting agent or representative?"
    When I select "My landlord does not have a letting agent or representative" for the question "Does your landlord have a letting agent or representative?"
    And I click "Save and continue"
    Then the page should include "Check your answers - Landlord details (placeholder)"
    When the citizen returns to the task list
    Then check that the user is redirected to the task-list citizen dashboard page

    # Landlord's notice. Upload screens are placeholders, so the journey continues without a file.
    When I click "Landlord's notice proposing a new rent"
    Then the page should include "Have landlord's notice?"
    When I click "Save and continue"
    Then the page should include "Do you think the notice is legally valid?"
    When I select "No" for the question "Do you think the notice is legally valid?"
    And I click "Save and continue"
    Then the page should include "Upload evidence to show why you think the notice is not legally valid"
    When I click "Save and continue"
    Then the page should include "Will a rent increase on the proposed start date cause you hardship?"
    When I select "Yes" for the question "Will a rent increase on the proposed start date cause you hardship?"
    And I enter "An increase in rent on the proposed start date would cause financial hardship." for the question "Tell us how you would experience financial hardship if the rent was increased on the proposed start date (optional)"
    And I click "Save and continue"
    Then the page should include "Upload your supporting evidence for how you would experience hardship"
    When I click "Save and continue"
    Then the page should include "Check your answers (placeholder)"
    When the citizen returns to the task list
    Then check that the user is redirected to the task-list citizen dashboard page

    # Tenancy agreement
    When I click "Your tenancy agreement"
    Then the page should include "Do you have a copy of your tenancy agreement to upload?"
    When I select "Yes" for the question "Do you have a copy of your tenancy agreement to upload?"
    And I click "Save and continue"
    Then the page should include "Upload tenancy agreement"
    When the citizen uploads a valid tenancy agreement file
    And I click "Save and continue"
    Then the page should include "Check your answers"
    When I click "Complete this section"
    Then check that the user is redirected to the task-list citizen dashboard page

    # Current rent and other costs
    When I click "The current rent and other costs"
    Then the page should include "Has the tribunal previously determined the rent for your tenancy?"
    When I select "No" for the question "Has the tribunal previously determined the rent for your tenancy?"
    And I click "Save and continue"
    Then the page should include "How often do you pay your rent?"
    When I select "Weekly" for the question "How often do you pay your rent?"
    And I enter "800" for the question "How much is the current weekly rent?"
    And I click "Save and continue"
    Then the page should include "Does your rent include council tax?"
    When I select "No" for the question "Does your rent include council tax?"
    And I click "Save and continue"
    Then the page should include "Does the rent include any charges for utilities?"
    When I select "No" for the question "Does the rent include any charges for utilities?"
    And I click "Save and continue"
    Then the page should include "When did your current tenancy start?"
    When I enter the date "01/01/2024" for the question "When did your current tenancy start?"
    And I click "Save and continue"
    Then the page should include "When does your tenancy end?"
    When I enter the date "01/01/2028" for the question "When does your tenancy end?"
    And I click "Save and continue"
    Then the page should include "Does your current tenancy replace an original tenancy?"
    When I select "No" for the question "Does your current tenancy replace an original tenancy?"
    And I click "Save and continue"
    Then the page should include "Are you charged separately for anything else?"
    When I select "No" for the question "Are you charged separately for anything else?"
    And I click "Save and continue"
    Then the page should include "Check your answers"
    When I click "Complete this section"
    Then check that the user is redirected to the task-list citizen dashboard page

    # Proposed market rent. This section has no check-your-answers page, so the last continue opens property details.
    When I click "What you think the market rent should be"
    Then the page should include "What do you think is the weekly market rent you should pay?"
    When I enter "700" for the question "What do you think is the weekly market rent you should pay?"
    And I click "Save and continue"
    Then the page should include "What are your reasons for your proposed market rent? (optional)"
    When I enter "Similar properties nearby are advertised at a lower weekly rent." for the question "What are your reasons for your proposed market rent? (optional)"
    And I click "Save and continue"
    Then the page should include "Upload evidence to support your proposed market rent"
    When I click "Save and continue"

    # Property details
    Then the page should include "What is the address of the property?"
    When I enter "10 Downing Street" for the question "Address line 1"
    And I enter "London" for the question "Town or city"
    And I enter "SW1A 2AA" for the question "Postcode"
    And I click "Save and continue"
    Then the page should include "What are you renting?"
    When I select "Terraced house" for the question "What are you renting?"
    And I click "Save and continue"
    Then the page should include "Do you have a floor plan of the property?"
    When I select "No" for the question "Do you have a floor plan of the property?"
    And I click "Save and continue"
    Then the page should include "Tell us about the property's indoor features (optional)"
    When I enter "The property has gas central heating, double glazing and laminate flooring." for the question "Tell us about the property's indoor features (optional)"
    And I click "Save and continue"
    Then the page should include "Does the tenancy include any other facilities?"
    When I select "No" for the question "Does the tenancy include any other facilities?"
    And I click "Save and continue"
    Then the page should include "Do you share the property with your landlord?"
    When I select "No" for the question "Do you share the property with your landlord?"
    And I click "Save and continue"
    Then the page should include "Upload a photo of the outside of the property (optional)"
    When I click "Save and continue"
    Then the page should include "Upload a photo of each room at your property (optional)"
    When I click "Save and continue"
    Then the page should include "Is furniture provided in your tenancy?"
    When I select "No" for the question "Is furniture provided in your tenancy?"
    And I click "Save and continue"
    Then the page should include "Are any services provided in your tenancy?"
    When I select "No" for the question "Are any services provided in your tenancy?"
    And I click "Save and continue"
    Then the page should include "What repairs are the landlord's responsibility? (optional)"
    When I enter "The landlord is responsible for the structure and exterior." for the question "What repairs are the landlord's responsibility? (optional)"
    And I click "Save and continue"
    Then the page should include "What repairs are the tenant's responsibility? (optional)"
    When I enter "The tenant is responsible for interior decoration." for the question "What repairs are the tenant's responsibility? (optional)"
    And I click "Save and continue"
    Then the page should include "Have you or any past tenants made any changes or repairs to the property?"
    When I select "No" for the question "Have you or any past tenants made any changes or repairs to the property?"
    And I click "Save and continue"
    Then the page should include "The property"
    When the citizen returns to the task list
    Then check that the user is redirected to the task-list citizen dashboard page

    # Inspection and hearing
    When I click "Tell us if you think an inspection, a hearing, or both are needed"
    Then the page should include "Do you agree to the tribunal making a decision without an inspection?"
    When I select "Yes" for the question "Do you agree to the tribunal making a decision without an inspection?"
    And I click "Save and continue"
    Then the page should include "Do you agree in the tribunal making a decision without a hearing?"
    When I select "Yes" for the question "Do you agree in the tribunal making a decision without a hearing?"
    And I click "Save and continue"
    Then the page should include "Check your answers (placeholder)"
    When the citizen returns to the task list
    Then check that the user is redirected to the task-list citizen dashboard page

    # Extra support is a placeholder with no questions yet
    When I click "Tell us if you need extra support during your case"
    Then the page should include "Tell us if you need extra support during your case"
    When I click "Back"
    Then check that the user is redirected to the task-list citizen dashboard page

    # Help with fees
    When I click "Tell us if you are eligible for help with fees"
    Then the page should include "The fee for this application(placeholder)"
    When I click "Save and continue"
    Then the page should include "Have you already applied for help with your application fee?"
    When I select "Yes" for the question "Have you already applied for help with your application fee?"
    And I enter "HWF-A1B-23C" for the question "Enter your help with fees reference number"
    And I click "Save and continue"
    Then the page should include "Check your answers - Help with fees(placeholder)"
    When the citizen returns to the task list
    Then check that the user is redirected to the task-list citizen dashboard page
    And the page should include "Check your answers and submit your application"
