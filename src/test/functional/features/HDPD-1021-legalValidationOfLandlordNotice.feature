@JIRA-EPIC:HDPD-1021

Feature: Only challenging the legal validity of the landlord's notice
    # Need to investigate pdf verification in headless mode 
    # @AC1 @JIRA-TEST-KEY:PTSD-752
    # Scenario: Download paper form
    #     Given I am on the "What type of application do you want to make" page
    #     When I select the "Only challenge the legal validity of a landlord notice proposing a new rent" option
    #     And I click 'Continue'
    #     Then I am taken to challenging legal validation notice page
    #     When I selects download paper form
    #     # Then I am taken in to  the paper application form

    @AC2 @JIRA-TEST-KEY:PTSD-753
    Scenario: View GOV.UK guidance
        
        Given I am on the "What type of application do you want to make" page
        When I select the "Only challenge the legal validity of a landlord notice proposing a new rent" option
        And I click 'Continue'
        Then I am taken to challenging legal validation notice page
        When the citizen selects the guidance on GOV.UK link
        Then the citizen is taken to the GOV.UK guidance page