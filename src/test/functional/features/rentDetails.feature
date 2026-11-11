@JIRA-TEST-KEY:HDPD-591 @regression @WIP
Feature: Current rent payment frequency
    As a PT user completing the application
    I want to enter how often I pay rent and the matching amount
    So that my current rent is recorded accurately

    Background:
        Given the user navigates to PT url
        And the user has successfully logged on to market-rent-determination application
        Then check that the user is redirected to the my-application page
        When user clicks on the my application link
        Then check that the user is redirected to the application-type page
        And I select the option "Challenge my rent as excessive within the first 6 months of the tenancy"
        And I click "Continue"
        Then check that the user is redirected to the "tenancy-type" page
        And I select the option "Assured periodic tenancy"
        And I click "Continue"
        And I click "Current rent, other costs and your proposed market rent"
        And I select "Yes" for the question "Has the tribunal previously determined the rent for your tenancy?"
        And I enter tribunal case reference number as "LON/00AD/SMO/2023/0002"
        And I click "Save and continue"
        Then the page URL should be "rent-payment-frequency"

    @JIRA-TEST-KEY:PTSD-850
    Scenario: Rent frequency page content
        Then I check that the text "How often do you pay your rent?" is displayed on the page
        And the page should include "In your current tenancy agreement"
        And rent frequency options should appear in order
        And I should see the button "Save and continue"
        And I should see the button "Save for later"

    @AC2 @AC3 @AC4 @AC5
    Scenario Outline: Selecting frequency reveals a required rent amount with currency prefix
        When I select "<frequency>" for the question "How often do you pay your rent?"
        Then the rent amount field "<amountLabel>" should display a pound prefix
        When I click "Save and continue"
        Then I should see an error summary link for "<requiredError>"
        And I should see inline error "<requiredError>" for the question "<amountLabel>"
        And the page URL should be "rent-payment-frequency"
        When I click back link
        And I click "Save and continue"
        Then no option should be selected for the question "How often do you pay your rent?"
        Examples:
            | frequency                   | amountLabel                               | requiredError                      |
            | Weekly                      | How much is the current weekly rent?      | Enter the current weekly rent      |
            | Fortnightly (every 2 weeks) | How much is the current fortnightly rent? | Enter the current fortnightly rent |
            | Monthly                     | How much is the current monthly rent?     | Enter the current monthly rent     |
            | Yearly                      | How much is the current yearly rent?      | Enter the current yearly rent      |

    @AC6
    Scenario: Save and continue saves the rent amount and moves to council tax
        When I select "Monthly" for the question "How often do you pay your rent?"
        And I enter "950.50" for "monthly" rent amount
        And I click "Save and continue"
        Then I check that the text "Does your rent include council tax?" is displayed on the page
        When I click back link
        Then I check "Monthly" is selected for the question "How often do you pay your rent?"
        And I check "950.50" for the question "How much is the current monthly rent?"

    @AC7
    Scenario: Save for later returns to the citizen dashboard
        When I select "Weekly" for the question "How often do you pay your rent?"
        And I enter "950" for "weekly" rent amount
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page
        When I click "Current rent, other costs and your proposed market rent"
        And I click "Save and continue"
        Then the page URL should be "rent-payment-frequency"
        And I check "Weekly" is selected for the question "How often do you pay your rent?"
        And I check "950.00" for the question "How much is the current weekly rent?"

    @AC8
    Scenario: Missing rent frequency shows a linked error and is not saved
        When I click "Save and continue"
        Then I should see an error summary link for "Select how often you pay your rent"
        And I should see inline error "Select how often you pay your rent" for the question "How often do you pay your rent?"
        And the page URL should be "rent-payment-frequency"
        And no option should be selected for the question "How often do you pay your rent?"
        When I click back link
        And I click "Save and continue"
        Then no option should be selected for the question "How often do you pay your rent?"

    @AC8
    Scenario: Invalid rent amount shows linked error and is not saved
        When I select "Weekly" for the question "How often do you pay your rent?"
        And I enter "not-a-number" for "weekly" rent amount
        And I click "Save and continue"
        Then I should see an error summary link for "Current rent amount must be a number with no more than 2 decimal places, like 950 or 950.50"
        And I should see inline error "Current rent amount must be a number with no more than 2 decimal places, like 950 or 950.50" for the question "How much is the current weekly rent?"
        And the page URL should be "rent-payment-frequency"
        When I click back link
        And I click "Save and continue"
        Then no option should be selected for the question "How often do you pay your rent?"
