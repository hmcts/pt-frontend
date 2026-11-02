@JIRA-EPIC:HDPD-996 @regression @WIP
Feature: Links on the "You need to use another form to apply" page
    As a citizen whose landlord is a housing association
    I want links to the correct application routes
    So that I can apply using the right form

    Background:
        Given I have selected Housing association as my landlord
        Then user is taken to "You need to use another form to apply" page

    @AC1 @JIRA-TEST-KEY:PTSD-443
    Scenario: Online application form link goes to the online form
        When the citizen selects the online application form link
        Then the citizen is taken to the online application form

    @AC2 @JIRA-TEST-KEY:PTSD-444
    Scenario: Paper form link goes to the paper application form
        When the citizen selects the downloading the paper form link
        Then the citizen is taken to the paper application form

    @AC3 @JIRA-TEST-KEY:PTSD-445
    Scenario: Guidance link goes to the GOV.UK guidance page
        When the citizen selects the guidance on GOV.UK link
        Then the citizen is taken to the GOV.UK guidance page
