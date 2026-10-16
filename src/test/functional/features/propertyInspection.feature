@JIRA-EPIC:HDPD-621 @regression

Feature: Validate Property Inspection Page

    Background:
        Given the user navigates to PT url
        And the user has successfully logged on to market-rent-determination application
        When user clicks on the my application link
        Then check that the user is redirected to the application-type page
        And I select the option "Challenge my rent as excessive within the first 6 months of the tenancy"
        And I click "Continue"
        Then check that the user is redirected to the "tenancy-type" page
        And I select the option "Assured periodic tenancy"
        And I click "Continue"
        Then check that the user is redirected to the task-list citizen dashboard page
        When I click "Tell us if you think an inspection, a hearing, or both are needed" link
        Then I check that the text "Property inspection" is displayed on the page


    @AC1 @JIRA-TEST-KEY:PTSD-867
    Scenario:  Page content

        Then I check that the text "The tribunal will usually make its decision based on the documents and evidence provided by you and the landlord." is displayed on the page
        And I check that the text "Only ask for an inspection if you think there are reasons that your evidence cannot show." is displayed on the page
        And I check that the text "The tribunal will decide if an inspection is needed." is displayed on the page

    @AC2 @JIRA-TEST-KEY:PTSD-868
    Scenario: Conditional reveal when No is selected

        When I select "No" for the question "Do you agree to the tribunal making a decision without an inspection?"
        Then I check that the text "Tell us why you think an inspection is needed" is displayed on the page
        And I check that the text "For example, if the condition or quality of the property is not shown properly in pictures - describe this in detail" is displayed on the page

    @AC3 @JIRA-TEST-KEY:PTSD-868
    Scenario: Reason field is mandatory when No is selected

        When I select "No" for the question "Do you agree to the tribunal making a decision without an inspection?"
        And I click "Save and continue"
        Then I check that the error message "Enter why you think an inspection is needed" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-869
    Scenario: Save and continue with Yes selected

        When I select "Yes" for the question "Do you agree to the tribunal making a decision without an inspection?"
        And I click "Save and continue"
        Then I check that the text "Hearing" is displayed on the page

    @AC5 @JIRA-TEST-KEY:PTSD-869
    Scenario: Save and continue with No selected and reason entered

        When I select "No" for the question "Do you agree to the tribunal making a decision without an inspection?"
        And I enter "Inspection detail is provided" for the question "Tell us why you think an inspection is needed"
        And I click "Save and continue"
        Then I check that the text "Hearing" is displayed on the page


    @AC6 @JIRA-TEST-KEY:PTSD-870
    Scenario: Error when no radio option selected

        When  I click "Save and continue"
        Then I check that the error message "Select yes if you agree to the tribunal making a decision without an inspection" is displayed on the page