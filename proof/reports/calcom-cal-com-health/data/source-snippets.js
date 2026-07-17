window.__SCRIBE_SOURCE_SNIPPETS__ = [
  {
    "anchorId": "source-repository-health-complexity-handler-71962a93c2",
    "code": "}\n\nasync function handler(\n  this: RegularBookingService,\n  input: BookingHandlerInput,\n  deps: IBookingServiceDependencies,\n  bookingDataSchemaGetter: BookingDataSchemaGetter = getBookingDataSchema\n) {\n  const {\n    bookingData: rawBookingData,\n    userId,\n    userUuid,\n    platformClientId,\n    platformCancelUrl,\n    platformBookingUrl,\n    platformRescheduleUrl,\n    platformBookingLocation,\n    hostname,\n    forcedSlug,\n    areCalendarEventsEnabled = true,\n    skipAvailabilityCheck = false,\n    skipEventLimitsCheck = false,\n    skipCalendarSyncTaskCreation = false,\n    traceContext: passedTraceContext,\n  } = input;\n  let bookingEmailsAndSmsTaskerAction: BookingActionType = BookingActionMap.requested;\n\n  const traceContext = passedTraceContext\n    ? passedTraceContext\n    : distributedTracing.createTrace(\"booking_creation\");\n\n  const tracingLogger = distributedTracing.getTracingLogger(traceContext, {\n    eventTypeId: rawBookingData.eventTypeId,\n    userId: userId,\n    eventTypeSlug: rawBookingData.eventTypeSlug,\n  });\n\n  const isPlatformBooking = !!platformClientId;\n\n  const eventType = await getEventType({\n    eventTypeId: rawBookingData.eventTypeId,\n    eventTypeSlug: rawBookingData.eventTypeSlug,\n  });\n\n  // Early validation: Check reschedule restrictions if rescheduling\n  await validateRescheduleRestrictions({\n    rescheduleUid: rawBookingData.rescheduleUid,\n    userId: userId ?? null,\n    eventType: eventType\n      ? {\n          seatsPerTimeSlot: eventType.seatsPerTimeSlot,\n          minimumRescheduleNotice: eventType.minimumRescheduleNotice ?? null,\n        }\n      : null,\n  });\n\n  const bookingDataSchema = bookingDataSchemaGetter({\n    view: rawBookingData.rescheduleUid ? \"reschedule\" : \"booking\",\n    bookingFields: eventType.bookingFields,\n  });\n\n  const bookingData = await getBookingData({\n    reqBody: rawBookingData,\n    eventType,\n    schema: bookingDataSchema,\n  });\n\n  const {\n    recurringCount,\n    noEmail,\n    eventTypeId,\n    eventTypeSlug,\n    hasHashedBookingLink,\n    language,\n    appsStatus: reqAppsStatus,\n    name: bookerName,\n    attendeePhoneNumber: bookerPhoneNumber,\n    email: bookerEmail,\n    guests: reqGuests,\n    location,\n    notes: additionalNotes,\n    smsReminderNumber,\n    rescheduleReason,\n    luckyUsers,\n    routedTeamMemberIds,\n    rrHostSubsetIds,\n    _isDryRun: isDryRun = false,\n    ...reqBody\n  } = bookingData;\n\n  let troubleshooterData = buildTroubleshooterData({\n    eventType,\n  });\n\n  const emailsAndSmsHandler = new BookingEmailSmsHandler({ logger: tracingLogger });\n\n  try {\n    await checkIfBookerEmailIsBlocked({\n      loggedInUserId: userId,\n      bookerEmail,\n      verificationCode: reqBody.verificationCode,\n      isReschedule: !!rawBookingData.rescheduleUid,\n    });\n  } catch (error) {\n    if (error instanceof ErrorWithCode) {\n      throw new HttpError({ statusCode: 403, message: error.message });\n    }\n    throw error;\n  }\n\n  const spamCheckService = getSpamCheckService();\n\n  const eventTypeOrganizationId =\n    eventType.team?.parentId ??\n    eventType.parent?.team?.parentId ??\n    eventType.owner?.profiles?.[0]?.organizationId ??\n    null;\n  spamCheckService.startCheck({ email: bookerEmail, organizationId: eventTypeOrganizationId });\n\n  if (!rawBookingData.rescheduleUid) {\n    await checkActiveBookingsLimitForBooker({\n      eventTypeId,\n      maxActiveBookingsPerBooker: eventType.maxActiveBookingsPerBooker,\n      bookerEmail,\n      offerToRescheduleLastBooking: eventType.maxActiveBookingPerBookerOfferReschedule,\n    });\n  }\n\n  if (eventType.requiresBookerEmailVerification && !rawBookingData.rescheduleUid) {\n    const verificationCode = reqBody.verificationCode;\n    if (!verificationCode) {\n      throw new HttpError({\n        statusCode: 400,\n        message: \"email_verification_required\",\n      });\n    }\n\n    try {\n      await verifyCodeUnAuthenticated(bookerEmail, verificationCode);\n    } catch {\n      throw new HttpError({\n        statusCode: 400,\n        message: \"invalid_verification_code\",\n      });\n    }\n  }\n\n  if (isEventTypeLoggingEnabled({ eventTypeId, usernameOrTeamName: reqBody.user })) {\n    tracingLogger.settings.minLevel = 0;\n  }\n\n  const fullName = getFullName(bookerName);\n  // Why are we only using \"en\" locale\n  const tGuests = await getTranslation(\"en\", \"common\");\n\n  const dynamicUserList = Array.isArray(reqBody.user) ? reqBody.user : getUsernameList(reqBody.user);\n  if (!eventType)\n    throw new HttpError({\n      statusCode: 404,\n      message: \"event_type_not_found\",\n    });\n\n  if (eventType.seatsPerTimeSlot && eventType.recurringEvent) {\n    throw new HttpError({\n      statusCode: 400,\n      message: \"recurring_event_seats_error\",\n    });\n  }\n\n  const bookingSeat = reqBody.rescheduleUid ? await getSeatedBooking(reqBody.rescheduleUid) : null;\n  const rescheduleUid = bookingSeat ? bookingSeat.booking.uid : reqBody.rescheduleUid;\n  const isNormalBookingOrFirstRecurringSlot = input.bookingData.allRecurringDates\n    ? !!input.bookingData.isFirstRecurringSlot\n    : true;\n\n  let originalRescheduledBooking = rescheduleUid\n    ? await getOriginalRescheduledBooking(rescheduleUid, !!eventType.seatsPerTimeSlot)\n    : null;\n\n  const paymentAppData = getPaymentAppData({\n    ...eventType,\n    metadata: eventTypeMetaDataSchemaWithTypedApps.parse(eventType.metadata),\n  });\n\n  const { userReschedulingIsOwner, isConfirmedByDefault } = await getRequiresConfirmationFlags({\n    eventType,\n    bookingStartTime: reqBody.start,\n    userId,\n    originalRescheduledBookingOrganizerId: originalRescheduledBooking?.user?.id,\n    paymentAppData,\n    bookerEmail,\n  });\n\n  // For unconfirmed bookings or round robin bookings with the same attendee and timeslot, return the original booking\n  if (\n    (!isConfirmedByDefault && !userReschedulingIsOwner) ||\n    eventType.schedulingType === SchedulingType.ROUND_ROBIN\n  ) {\n    const requiresPayment = !Number.isNaN(paymentAppData.price) && paymentAppData.price > 0;\n\n    const existingBooking = await deps.bookingRepository.getValidBookingFromEventTypeForAttendee({\n      eventTypeId,\n      bookerEmail,\n      bookerPhoneNumber,\n      startTime: new Date(dayjs(reqBody.start).utc().format()),\n      filterForUnconfirmed: !isConfirmedByDefault,\n    });\n\n    if (existingBooking) {\n      const hasPayments = existingBooking.payment.length > 0;\n      const isPaidBooking = existingBooking.paid || !hasPayments;\n\n      const shouldShowPaymentForm = requiresPayment && !isPaidBooking;\n\n      const firstPayment = shouldShowPaymentForm ? existingBooking.payment[0] : undefined;\n\n      const bookingResponse = {\n        ...existingBooking,\n        user: {\n          ...existingBooking.user,\n          email: null,\n        },\n        paymentRequired: shouldShowPaymentForm,\n        seatReferenceUid: \"\",\n      };\n\n      return {\n        ...bookingResponse,\n        luckyUsers: bookingResponse.userId ? [bookingResponse.userId] : [],\n        isDryRun,\n        ...(isDryRun ? { troubleshooterData } : {}),\n        paymentUid: firstPayment?.uid,\n        paymentId: firstPayment?.id,\n        previousBooking: originalRescheduledBooking\n          ? {\n              uid: originalRescheduledBooking.uid,\n              startTime: originalRescheduledBooking.startTime,\n              endTime: originalRescheduledBooking.endTime,\n            }\n          : null,\n      };\n    }\n  }\n\n  const isTeamEventType =\n    !!eventType.schedulingType && [\"COLLECTIVE\", \"ROUND_ROBIN\"].includes(eventType.schedulingType);\n\n  // Use \"booking\" mode to bypass cache for booking confirmation\n  const calendarFetchMode = \"booking\" as const;\n\n  tracingLogger.info(\n    `Booking eventType ${eventTypeId} started`,\n    safeStringify({\n      reqBody: {\n        user: reqBody.user,\n        eventTypeId,\n        eventTypeSlug,\n        startTime: reqBody.start,\n        endTime: reqBody.end,\n        rescheduleUid: reqBody.rescheduleUid,\n        location: location,\n        timeZone: reqBody.timeZone,\n      },\n      isTeamEventType,\n      eventType: getPiiFreeEventType(eventType),\n      dynamicUserList,\n      paymentAppData: {\n        enabled: paymentAppData.enabled,\n        price: paymentAppData.price,\n        paymentOption: paymentAppData.paymentOption,\n        currency: paymentAppData.currency,\n        appId: paymentAppData.appId,\n      },\n    })\n  );\n\n  const user = eventType.users.find((user) => user.id === eventType.userId);\n  const userSchedule = user?.schedules.find((schedule) => schedule.id === user?.defaultScheduleId);\n  const eventTimeZone = eventType.schedule?.timeZone ?? userSchedule?.timeZone;\n\n  await validateBookingTimeIsNotOutOfBounds<typeof eventType>(\n    reqBody.start,\n    reqBody.timeZone,\n    eventType,\n    eventTimeZone,\n    tracingLogger\n  );\n\n  validateEventLength({\n    reqBodyStart: reqBody.start,\n    reqBodyEnd: reqBody.end,\n    eventTypeMultipleDuration: eventType.metadata?.multipleDuration,\n    eventTypeLength: eventType.length,\n    logger: tracingLogger,\n  });\n\n  const contactOwnerFromReq = reqBody.teamMemberEmail ?? null;\n\n  const skipContactOwner = shouldIgnoreContactOwner({\n    skipContactOwner: reqBody.skipContactOwner ?? null,\n    rescheduleUid: reqBody.rescheduleUid ?? null,\n    routedTeamMemberIds: routedTeamMemberIds ?? null,\n  });\n\n  const contactOwnerEmail = skipContactOwner ? null : contactOwnerFromReq;\n  const _crmRecordId: string | undefined = reqBody.crmRecordId ?? undefined;\n\n  const { qualifiedRRUsers, additionalFallbackRRUsers, fixedUsers } = await loadAndValidateUsers({\n    hostname,\n    forcedSlug,\n    isPlatform: isPlatformBooking,\n    eventType,\n    eventTypeId,\n    dynamicUserList,\n    logger: tracingLogger,\n    routedTeamMemberIds: routedTeamMemberIds ?? null,\n    contactOwnerEmail,\n    rescheduleUid: reqBody.rescheduleUid || null,\n    rrHostSubsetIds: rrHostSubsetIds ?? undefined,\n  });\n\n  // We filter out users but ensure allHostUsers remain same.\n  let users = [...qualifiedRRUsers, ...additionalFallbackRRUsers, ...fixedUsers];\n\n  const firstUser = users[0];\n\n  let { locationBodyString, organizerOrFirstDynamicGroupMemberDefaultLocationUrl } = getLocationValuesForDb({\n    dynamicUserList,\n    users,\n    location,\n  });\n\n  if (!skipEventLimitsCheck) {\n    await deps.checkBookingAndDurationLimitsService.checkBookingAndDurationLimits({\n      eventType,\n      reqBodyStart: reqBody.start,\n      reqBodyRescheduleUid: reqBody.rescheduleUid,\n    });\n  }\n\n  let luckyUserResponse;\n  let isFirstSeat = true;\n  let availableUsers: IsFixedAwareUser[] = [];\n\n  if (eventType.seatsPerTimeSlot) {\n    const booking = await deps.prismaClient.booking.findFirst({\n      where: {\n        eventTypeId: eventType.id,\n        startTime: new Date(dayjs(reqBody.start).utc().format()),\n        status: BookingStatus.ACCEPTED,\n      },\n      select: {\n        userId: true,\n        attendees: { select: { email: true } },\n      },\n    });\n\n    if (booking) {\n      isFirstSeat = false;\n      if (eventType.schedulingType === SchedulingType.ROUND_ROBIN) {\n        const fixedHosts = users.filter((user) => user.isFixed);\n        const originalNonFixedHost = users.find((user) => !user.isFixed && user.id === booking.userId);\n\n        if (originalNonFixedHost) {\n          users = [...fixedHosts, originalNonFixedHost];\n        } else {\n          const attendeeEmailSet = new Set(booking.attendees.map((attendee) => attendee.email));\n\n          // In this case, the first booking user is a fixed host, so the chosen non-fixed host is added as an attendee of the booking\n          const nonFixedAttendeeHost = users.find(\n            (user) => !user.isFixed && attendeeEmailSet.has(user.email)\n          );\n          users = [...fixedHosts, ...(nonFixedAttendeeHost ? [nonFixedAttendeeHost] : [])];\n        }\n      }\n    }\n  }\n\n  //checks what users are available\n  if (isFirstSeat) {\n    const eventTypeWithUsers: Omit<getEventTypeResponse, \"users\"> & {\n      users: IsFixedAwareUserWithCredentials[];\n    } = {\n      ...eventType,\n      minimumRescheduleNotice: eventType.minimumRescheduleNotice ?? null,\n      users: users as IsFixedAwareUserWithCredentials[],\n      ...(eventType.recurringEvent && {\n        recurringEvent: {\n          ...eventType.recurringEvent,\n          count: recurringCount || eventType.recurringEvent.count,\n        },\n      }),\n    };\n    if (\n      input.bookingData.allRecurringDates &&\n      input.bookingData.isFirstRecurringSlot &&\n      input.bookingData.numSlotsToCheckForAvailability\n    ) {\n      const isTeamEvent =\n        eventType.schedulingType === SchedulingType.COLLECTIVE ||\n        eventType.schedulingType === SchedulingType.ROUND_ROBIN;\n\n      const fixedUsers = isTeamEvent\n        ? eventTypeWithUsers.users.filter((user: IsFixedAwareUserWithCredentials) => user.isFixed)\n        : [];\n\n      for (\n        let i = 0;\n        i < input.bookingData.allRecurringDates.length &&\n        i < input.bookingData.numSlotsToCheckForAvailability;\n        i++\n      ) {\n        const start = input.bookingData.allRecurringDates[i].start;\n        const end = input.bookingData.allRecurringDates[i].end;\n        if (isTeamEvent) {\n          // each fixed user must be available\n          for (const key in fixedUsers) {\n            if (!skipAvailabilityCheck) {\n              await ensureAvailableUsers(\n                { ...eventTypeWithUsers, users: [fixedUsers[key]] },\n                {\n                  dateFrom: dayjs(start).tz(reqBody.timeZone).format(),\n                  dateTo: dayjs(end).tz(reqBody.timeZone).format(),\n                  timeZone: reqBody.timeZone,\n                  originalRescheduledBooking: originalRescheduledBooking ?? null,\n                },\n                tracingLogger,\n                calendarFetchMode\n              );\n            }\n          }\n        } else {\n          if (!skipAvailabilityCheck) {\n            await ensureAvailableUsers(\n              eventTypeWithUsers,\n              {\n                dateFrom: dayjs(start).tz(reqBody.timeZone).format(),\n                dateTo: dayjs(end).tz(reqBody.timeZone).format(),\n                timeZone: reqBody.timeZone,\n                originalRescheduledBooking,\n              },\n              tracingLogger,\n              calendarFetchMode\n            );\n          }\n        }\n      }\n    }\n\n    if (!input.bookingData.allRecurringDates || input.bookingData.isFirstRecurringSlot) {\n      try {\n        if (!skipAvailabilityCheck) {\n          availableUsers = await ensureAvailableUsers(\n            { ...eventTypeWithUsers, users: [...qualifiedRRUsers, ...fixedUsers] as IsFixedAwareUser[] },\n            {\n              dateFrom: dayjs(reqBody.start).tz(reqBody.timeZone).format(),\n              dateTo: dayjs(reqBody.end).tz(reqBody.timeZone).format(),\n              timeZone: reqBody.timeZone,\n              originalRescheduledBooking,\n            },\n            tracingLogger,\n            calendarFetchMode\n          );\n        } else {\n          availableUsers = [...qualifiedRRUsers, ...fixedUsers] as IsFixedAwareUser[];\n        }\n      } catch {\n        if (additionalFallbackRRUsers.length) {\n          tracingLogger.debug(\n            \"Qualified users not available, check for fallback users\",\n            safeStringify({\n              qualifiedRRUsers: qualifiedRRUsers.map((user) => user.id),\n              additionalFallbackRRUsers: additionalFallbackRRUsers.map((user) => user.id),\n            })\n          );\n          // can happen when contact owner not available for 2 weeks or fairness would block at least 2 weeks\n          // use fallback instead\n          if (!skipAvailabilityCheck) {\n            availableUsers = await ensureAvailableUsers(\n              {\n                ...eventTypeWithUsers,\n                users: [...additionalFallbackRRUsers, ...fixedUsers] as IsFixedAwareUser[],\n              },\n              {\n                dateFrom: dayjs(reqBody.start).tz(reqBody.timeZone).format(),\n                dateTo: dayjs(reqBody.end).tz(reqBody.timeZone).format(),\n                timeZone: reqBody.timeZone,\n                originalRescheduledBooking,\n              },\n              tracingLogger,\n              calendarFetchMode\n            );\n          } else {\n            availableUsers = [...additionalFallbackRRUsers, ...fixedUsers] as IsFixedAwareUser[];\n          }\n        } else {\n          tracingLogger.debug(\n            \"Qualified users not available, no fallback users\",\n            safeStringify({\n              qualifiedRRUsers: qualifiedRRUsers.map((user) => user.id),\n            })\n          );\n          throw new Error(ErrorCode.NoAvailableUsersFound);\n        }\n      }\n\n      const fixedUserPool: IsFixedAwareUser[] = [];\n      const nonFixedUsers: IsFixedAwareUser[] = [];\n\n      availableUsers.forEach((user) => {\n        if (user.isFixed) {\n          fixedUserPool.push(user);\n        } else {\n          nonFixedUsers.push(user);\n        }\n      });\n\n      // Group non-fixed users by their group IDs\n      const luckyUserPools = groupHostsByGroupId({\n        hosts: nonFixedUsers,\n        hostGroups: eventType.hostGroups,\n      });\n\n      const notAvailableLuckyUsers: typeof users = [];\n\n      tracingLogger.debug(\n        \"Computed available users\",\n        safeStringify({\n          availableUsers: availableUsers.map((user) => user.id),\n          luckyUserPools: Object.fromEntries(\n            Object.entries(luckyUserPools).map(([groupId, users]) => [groupId, users.map((user) => user.id)])\n          ),\n        })\n      );\n\n      const luckyUsers: typeof users = [];\n      // loop through all non-fixed hosts and get the lucky users\n      // This logic doesn't run when contactOwner is used because in that case, luckUsers.length === 1\n      for (const [groupId, luckyUserPool] of Object.entries(luckyUserPools)) {\n        let luckUserFound = false;\n        while (luckyUserPool.length > 0 && !luckUserFound) {\n          const freeUsers = luckyUserPool.filter(\n            (user) => !luckyUsers.concat(notAvailableLuckyUsers).find((existing) => existing.id === user.id)\n          );\n          // no more freeUsers after subtracting notAvailableLuckyUsers from luckyUsers :(\n          if (freeUsers.length === 0) break;\n          assertNonEmptyArray(freeUsers); // make sure TypeScript knows it too with an assertion; the error will never be thrown.\n          // freeUsers is ensured\n\n          const userIdsSet = new Set(users.map((user) => user.id));\n          const newLuckyUser = await deps.luckyUserService.getLuckyUser({\n            availableUsers: freeUsers,\n            allRRHosts: eventTypeWithUsers.hosts.filter(\n              (host) =>\n                !host.isFixed &&\n                userIdsSet.has(host.user.id) &&\n                (host.groupId === groupId || (!host.groupId && groupId === DEFAULT_GROUP_ID))\n            ),\n            eventType,\n            meetingStartTime: new Date(reqBody.start),\n          });\n          if (!newLuckyUser) {\n            break; // prevent infinite loop\n          }\n          if (\n            input.bookingData.isFirstRecurringSlot &&\n            eventType.schedulingType === SchedulingType.ROUND_ROBIN &&\n            input.bookingData.numSlotsToCheckForAvailability &&\n            input.bookingData.allRecurringDates\n          ) {\n            // for recurring round robin events check if lucky user is available for next slots\n            try {\n              for (\n                let i = 0;\n                i < input.bookingData.allRecurringDates.length &&\n                i < input.bookingData.numSlotsToCheckForAvailability;\n                i++\n              ) {\n                const start = input.bookingData.allRecurringDates[i].start;\n                const end = input.bookingData.allRecurringDates[i].end;\n\n                if (!skipAvailabilityCheck) {\n                  await ensureAvailableUsers(\n                    { ...eventTypeWithUsers, users: [newLuckyUser] },\n                    {\n                      dateFrom: dayjs(start).tz(reqBody.timeZone).format(),\n                      dateTo: dayjs(end).tz(reqBody.timeZone).format(),\n                      timeZone: reqBody.timeZone,\n                      originalRescheduledBooking,\n                    },\n                    tracingLogger,\n                    calendarFetchMode\n                  );\n                }\n              }\n              // if no error, then lucky user is available for the next slots\n              luckyUsers.push(newLuckyUser);\n              luckUserFound = true;\n            } catch {\n              notAvailableLuckyUsers.push(newLuckyUser);\n              tracingLogger.info(\n                `Round robin host ${newLuckyUser.name} not available for first two slots. Trying to find another host.`\n              );\n            }\n          } else {\n            luckyUsers.push(newLuckyUser);\n            luckUserFound = true;\n          }\n        }\n      }\n\n      // ALL fixed users must be available\n      if (fixedUserPool.length !== users.filter((user) => user.isFixed).length) {\n        throw new Error(ErrorCode.FixedHostsUnavailableForBooking);\n      }\n\n      const roundRobinHosts = eventType.hosts.filter((host) => !host.isFixed);\n\n      const hostGroups = groupHostsByGroupId({\n        hosts: roundRobinHosts,\n        hostGroups: eventType.hostGroups,\n      });\n\n      // Filter out host groups that have no hosts in them\n      const nonEmptyHostGroups = Object.fromEntries(\n        Object.entries(hostGroups).filter(([, hosts]) => hosts.length > 0)\n      );\n      // If there are RR hosts, we need to find a lucky user\n      if (\n        [...qualifiedRRUsers, ...additionalFallbackRRUsers].length > 0 &&\n        luckyUsers.length !== (Object.keys(nonEmptyHostGroups).length || 1)\n      ) {\n        throw new Error(ErrorCode.RoundRobinHostsUnavailableForBooking);\n      }\n\n      // Pushing fixed user before the luckyUser guarantees the (first) fixed user as the organizer.\n      users = [...fixedUserPool, ...luckyUsers];\n      luckyUserResponse = { luckyUsers: luckyUsers.map((u) => u.id) };\n      troubleshooterData = {\n        ...troubleshooterData,\n        luckyUsers: luckyUsers.map((u) => u.id),\n        fixedUsers: fixedUserPool.map((u) => u.id),\n        luckyUserPool: Object.values(luckyUserPools)\n          .flat()\n          .map((u) => u.id),\n      };\n    } else if (\n      input.bookingData.allRecurringDates &&\n      eventType.schedulingType === SchedulingType.ROUND_ROBIN\n    ) {\n      // all recurring slots except the first one\n      const luckyUsersFromFirstBooking = luckyUsers\n        ? eventTypeWithUsers.users.filter((user) => luckyUsers.find((luckyUserId) => luckyUserId === user.id))\n        : [];\n      const fixedHosts = eventTypeWithUsers.users.filter((user: IsFixedAwareUser) => user.isFixed);\n      users = [...fixedHosts, ...luckyUsersFromFirstBooking];\n      troubleshooterData = {\n        ...troubleshooterData,\n        luckyUsersFromFirstBooking: luckyUsersFromFirstBooking.map((u) => u.id),\n        fixedUsers: fixedHosts.map((u) => u.id),\n      };\n    }\n  }\n\n  if (users.length === 0 && eventType.schedulingType === SchedulingType.ROUND_ROBIN) {\n    tracingLogger.error(`No available users found for round robin event.`);\n    throw new Error(ErrorCode.RoundRobinHostsUnavailableForBooking);\n  }\n\n  // If the team member is requested then they should be the organizer\n  const organizerUser = reqBody.teamMemberEmail\n    ? (users.find((user) => user.email === reqBody.teamMemberEmail) ?? users[0])\n    : users[0];\n\n  const tOrganizer = await getTranslation(organizerUser?.locale ?? \"en\", \"common\");\n  const allCredentials = await getAllCredentialsIncludeServiceAccountKey(organizerUser, eventType);\n\n  // If the Organizer himself is rescheduling, the booker should be sent the communication in his timezone and locale.\n  const attendeeInfoOnReschedule =\n    userReschedulingIsOwner && originalRescheduledBooking\n      ? originalRescheduledBooking.attendees.find((attendee) => attendee.email === bookerEmail)\n      : null;\n\n  const attendeeLanguage = attendeeInfoOnReschedule ? attendeeInfoOnReschedule.locale : language;\n  const attendeeTimezone = attendeeInfoOnReschedule ? attendeeInfoOnReschedule.timeZone : reqBody.timeZone;\n\n  const tAttendees = await getTranslation(attendeeLanguage ?? \"en\", \"common\");\n\n  const isManagedEventType = !!eventType.parentId;\n\n  // If location passed is empty , use default location of event\n  // If location of event is not set , use host default\n  if (locationBodyString.trim().length === 0) {\n    if (eventType.locations.length > 0) {\n      locationBodyString = eventType.locations[0].type;\n    } else {\n      locationBodyString = OrganizerDefaultConferencingAppType;\n    }\n  }\n\n  // use host default\n  if (locationBodyString === OrganizerDefaultConferencingAppType) {\n    const metadataParseResult = userMetadataSchema.safeParse(organizerUser.metadata);\n    const organizerMetadata = metadataParseResult.success ? metadataParseResult.data : undefined;\n    const defaultApp = organizerMetadata?.defaultConferencingApp;\n\n    if (defaultApp?.appSlug) {\n      const app = getAppFromSlug(defaultApp.appSlug);\n      locationBodyString = app?.appData?.location?.type || locationBodyString;\n\n      const mainHostCalendar = eventType.destinationCalendar || organizerUser.destinationCalendar;\n\n      if (locationBodyString === MeetLocationType && mainHostCalendar?.integration !== \"google_calendar\") {\n        locationBodyString = \"integrations:daily\";\n        organizerOrFirstDynamicGroupMemberDefaultLocationUrl = undefined;\n      } else if (isManagedEventType || isTeamEventType) {\n        organizerOrFirstDynamicGroupMemberDefaultLocationUrl = defaultApp?.appLink;\n      }\n    } else {\n      locationBodyString = \"integrations:daily\";\n    }\n  }\n\n  const invitee: Invitee = [\n    {\n      email: bookerEmail,\n      name: fullName,\n      phoneNumber: bookerPhoneNumber,\n      firstName: (typeof bookerName === \"object\" && bookerName.firstName) || \"\",\n      lastName: (typeof bookerName === \"object\" && bookerName.lastName) || \"\",\n      timeZone: attendeeTimezone,\n      language: { translate: tAttendees, locale: attendeeLanguage ?? \"en\" },\n    },\n  ];\n\n  const blacklistedGuestEmails = process.env.BLACKLISTED_GUEST_EMAILS\n    ? process.env.BLACKLISTED_GUEST_EMAILS.split(\",\")\n    : [];\n\n  const guestEmails = (reqGuests || []).map((email) => extractBaseEmail(email).toLowerCase());\n  const guestUsers = await deps.userRepository.findManyByEmailsWithEmailVerificationSettings({\n    emails: guestEmails,\n  });\n\n  const emailToRequiresVerification = new Map<string, boolean>();\n  for (const user of guestUsers) {\n    const matchedBase = extractBaseEmail(user.matchedEmail ?? user.email).toLowerCase();\n    emailToRequiresVerification.set(matchedBase, user.requiresBookerEmailVerification === true);\n  }\n\n  const guestsRemoved: string[] = [];\n  const guests = (reqGuests || []).reduce((guestArray, guest) => {\n    const baseGuestEmail = extractBaseEmail(guest).toLowerCase();\n\n    if (blacklistedGuestEmails.some((e) => e.toLowerCase() === baseGuestEmail)) {\n      guestsRemoved.push(guest);\n      return guestArray;\n    }\n\n    if (emailToRequiresVerification.get(baseGuestEmail)) {\n      guestsRemoved.push(guest);\n      return guestArray;\n    }\n\n    // If it's a team event, remove the team member from guests\n    if (isTeamEventType && users.some((user) => user.email === guest)) {\n      return guestArray;\n    }\n    guestArray.push({\n      email: guest,\n      name: \"\",\n      firstName: \"\",\n      lastName: \"\",\n      timeZone: attendeeTimezone,\n      language: { translate: tGuests, locale: \"en\" },\n    });\n    return guestArray;\n  }, [] as Invitee);\n\n  if (guestsRemoved.length > 0) {\n    tracingLogger.info(\"Removed guests from the booking\", guestsRemoved);\n  }\n\n  const seed = `${organizerUser.username}:${dayjs(reqBody.start).utc().format()}:${Date.now()}`;\n  const uid = translator.fromUUID(uuidv5(seed, uuidv5.URL));\n\n  // For static link based video apps, it would have the static URL value instead of it's type(e.g. integrations:campfire_video)\n  // This ensures that createMeeting isn't called for static video apps as bookingLocation becomes just a regular value for them.\n  const { bookingLocation, conferenceCredentialId: eventTypeCredentialId } =\n    organizerOrFirstDynamicGroupMemberDefaultLocationUrl\n      ? {\n          bookingLocation: organizerOrFirstDynamicGroupMemberDefaultLocationUrl,\n          conferenceCredentialId: undefined,\n        }\n      : getLocationValueForDB(locationBodyString, eventType.locations);\n\n  // Use per-host credential if available, otherwise fall back to event type credential\n  const conferenceCredentialId = eventTypeCredentialId;\n\n  tracingLogger.info(\"locationBodyString\", locationBodyString);\n  tracingLogger.info(\"event type locations\", eventType.locations);\n\n  const customInputs = getCustomInputsResponses(reqBody, eventType.customInputs);\n  const attendeesList = [...invitee, ...guests];\n\n  const responses = reqBody.responses || null;\n  const evtName = !eventType?.isDynamic ? eventType.eventName : responses?.title;\n  const eventNameObject = {\n    //TODO: Can we have an unnamed attendee? If not, I would really like to throw an error here.\n    attendeeName: fullName || \"Nameless\",\n    eventType: eventType.title,\n    eventName: evtName,\n    // we send on behalf of team if >1 round robin attendee | collective\n    teamName: eventType.schedulingType === \"COLLECTIVE\" || users.length > 1 ? eventType.team?.name : null,\n    // TODO: Can we have an unnamed organizer? If not, I would really like to throw an error here.\n    host: organizerUser.name || \"Nameless\",\n    location: bookingLocation,\n    eventDuration: dayjs(reqBody.end).diff(reqBody.start, \"minutes\"),\n    bookingFields: { ...responses },\n    t: tOrganizer,\n  };\n\n  const iCalUID = getICalUID({\n    event: { iCalUID: originalRescheduledBooking?.iCalUID, uid: originalRescheduledBooking?.uid },\n    uid,\n  });\n  // For bookings made before introducing iCalSequence, assume that the sequence should start at 1. For new bookings start at 0.\n  const iCalSequence = getICalSequence(originalRescheduledBooking);\n  const organizerOrganizationProfile = await deps.prismaClient.profile.findFirst({\n    where: {\n      userId: organizerUser.id,\n    },\n    select: {\n      organizationId: true,\n      username: true,\n      organization: { select: { hideBranding: true } },\n    },\n  });\n\n  const organizerOrganizationId = organizerOrganizationProfile?.organizationId;\n  const bookerUrl = process.env.NEXT_PUBLIC_WEBAPP_URL || \"https://app.cal.com\";\n\n  const destinationCalendar = eventType.destinationCalendar\n    ? [eventType.destinationCalendar]\n    : organizerUser.destinationCalendar\n      ? [organizerUser.destinationCalendar]\n      : null;\n\n  let organizerEmail = organizerUser.email || \"Email-less\";\n  if (eventType.useEventTypeDestinationCalendarEmail && destinationCalendar?.[0]?.primaryEmail) {\n    organizerEmail = destinationCalendar[0].primaryEmail;\n  } else if (eventType.secondaryEmailId && eventType.secondaryEmail?.email) {\n    organizerEmail = eventType.secondaryEmail.email;\n  }\n\n  //update cal event responses with latest location value , later used by webhook\n  if (reqBody.calEventResponses)\n    reqBody.calEventResponses.location.value = {\n      value: platformBookingLocation ?? bookingLocation,\n      optionValue: \"\",\n    };\n\n  // Only attach recurring config when this booking belongs to a recurring series.\n  const computedRecurringEvent =\n    reqBody.recurringEventId && eventType.recurringEvent\n      ? { ...eventType.recurringEvent, count: recurringCount ?? eventType.recurringEvent.count }\n      : undefined;\n\n  const { teamMembers, teamDestinationCalendars } = await computeTeamData({\n    isTeamEventType,\n    schedulingType: eventType.schedulingType,\n    users,\n    organizerEmail: organizerUser.email,\n  });\n\n  const teamInfo = eventType.team;\n\n  const eventName = getEventName(eventNameObject);\n\n  let evt: BuiltCalendarEvent = new CalendarEventBuilder({\n    bookerUrl,\n    title: eventName,\n    startTime: dayjs(reqBody.start).utc().format(),\n    endTime: dayjs(reqBody.end).utc().format(),\n    type: eventType.slug,\n    organizer: {\n      id: organizerUser.id,\n      name: organizerUser.name || \"Nameless\",\n      email: organizerEmail,\n      username: organizerUser.username || undefined,\n      usernameInOrg: organizerOrganizationProfile?.username || undefined,\n      timeZone: organizerUser.timeZone,\n      language: { translate: tOrganizer, locale: organizerUser.locale ?? \"en\" },\n      timeFormat: getTimeFormatStringFromUserTimeFormat(organizerUser.timeFormat),\n    },\n    attendees: attendeesList,\n    additionalNotes,\n  })\n    .withEventType({\n      description: eventType.description,\n      id: eventType.id,\n      hideCalendarNotes: eventType.hideCalendarNotes,\n      hideCalendarEventDetails: eventType.hideCalendarEventDetails,\n      hideOrganizerEmail: eventType.hideOrganizerEmail,\n      schedulingType: eventType.schedulingType,\n      seatsPerTimeSlot: eventType.seatsPerTimeSlot,\n      // if seats are not enabled we should default true\n      seatsShowAttendees: eventType.seatsPerTimeSlot ? eventType.seatsShowAttendees : true,\n      seatsShowAvailabilityCount: eventType.seatsPerTimeSlot ? eventType.seatsShowAvailabilityCount : true,\n      customReplyToEmail: eventType.customReplyToEmail,\n      disableRescheduling: eventType.disableRescheduling ?? false,\n      disableCancelling: eventType.disableCancelling ?? false,\n    })\n    .withMetadataAndResponses({\n      additionalNotes,\n      customInputs,\n      responses: reqBody.calEventResponses || null,\n      userFieldsResponses: reqBody.calEventUserFieldsResponses || null,\n    })\n    .withLocation({\n      location: platformBookingLocation ?? bookingLocation, // Will be processed by the EventManager later.\n      conferenceCredentialId,\n    })\n    .withDestinationCalendar(\n      teamDestinationCalendars.length > 0\n        ? [...(destinationCalendar ?? []), ...teamDestinationCalendars]\n        : destinationCalendar\n    )\n    .withIdentifiers({ iCalUID, iCalSequence })\n    .withConfirmation({\n      requiresConfirmation: !isConfirmedByDefault,\n      isConfirmedByDefault,\n    })\n    .withPlatformVariables({\n      platformClientId,\n      platformRescheduleUrl,\n      platformCancelUrl,\n      platformBookingUrl,\n    })\n    .withOrganization(organizerOrganizationId)\n    .withHashedLink(hasHashedBookingLink ? (reqBody.hashedLink ?? null) : null)\n    .withRecurring(computedRecurringEvent ?? undefined)\n    .withRecurringEventId(input.bookingData.thirdPartyRecurringEventId)\n    .withTeam(\n      isTeamEventType\n        ? {\n            members: teamMembers,\n            name: teamInfo?.name || \"Nameless\",\n            id: teamInfo?.id ?? 0,\n          }\n        : undefined\n    )\n    .withHideBranding(\n      await getEventTypeService().shouldHideBrandingForEventType(eventType.id, {\n        team: eventType.team\n          ? { hideBranding: eventType.team.hideBranding, parent: eventType.team.parent }\n          : null,\n        owner: {\n          id: organizerUser.id,\n          hideBranding: organizerUser.hideBranding,\n          profiles: organizerOrganizationProfile\n            ? [{ organization: organizerOrganizationProfile.organization }]\n            : [],\n        },\n      } satisfies EventTypeBrandingData)\n    )\n    .build();\n\n  // data needed for triggering webhooks\n  const eventTypeInfo: EventTypeInfo = {\n    eventTitle: eventType.title,\n    eventDescription: eventType.description,\n    price: paymentAppData.price,\n    currency: eventType.currency,\n    length: dayjs(reqBody.end).diff(dayjs(reqBody.start), \"minutes\"),\n  };\n\n  const subscriberOptions: GetSubscriberOptions = {\n    userId: organizerUser.id,\n    eventTypeId,\n    triggerEvent: WebhookTriggerEvents.BOOKING_CREATED,\n    teamId: null,\n    orgId: null,\n    oAuthClientId: platformClientId,\n  };\n\n  const eventTrigger: WebhookTriggerEvents = rescheduleUid\n    ? WebhookTriggerEvents.BOOKING_RESCHEDULED\n    : WebhookTriggerEvents.BOOKING_CREATED;\n\n  subscriberOptions.triggerEvent = eventTrigger;\n\n  const subscriberOptionsMeetingEnded = {\n    userId: organizerUser.id,\n    eventTypeId,\n    triggerEvent: WebhookTriggerEvents.MEETING_ENDED,\n    teamId: null,\n    orgId: null,\n    oAuthClientId: platformClientId,\n  };\n\n  const subscriberOptionsMeetingStarted = {\n    userId: organizerUser.id,\n    eventTypeId,\n    triggerEvent: WebhookTriggerEvents.MEETING_STARTED,\n    teamId: null,\n    orgId: null,\n    oAuthClientId: platformClientId,\n  };\n\n  const spamCheckResult = await spamCheckService.waitForCheck();\n\n  if (spamCheckResult.isBlocked) {\n    const DECOY_ORGANIZER_NAMES = [\"Alex Smith\", \"Jordan Taylor\", \"Sam Johnson\", \"Chris Morgan\"];\n    const randomOrganizerName =\n      DECOY_ORGANIZER_NAMES[Math.floor(Math.random() * DECOY_ORGANIZER_NAMES.length)];\n\n    const eventName = getEventName({\n      ...eventNameObject,\n      host: randomOrganizerName,\n    });\n\n    return {\n      id: 0,\n      uid,\n      iCalUID: \"\",\n      status: BookingStatus.ACCEPTED,\n      eventTypeId: eventType.id,\n      user: {\n        name: randomOrganizerName,\n        timeZone: \"UTC\",\n        email: null,\n      },\n      userId: null,\n      userUuid: null,\n      title: eventName,\n      startTime: new Date(reqBody.start),\n      endTime: new Date(reqBody.end),\n      createdAt: new Date(),\n      updatedAt: new Date(),\n      attendees: [\n        {\n          id: 0,\n          email: bookerEmail,\n          name: fullName,\n          timeZone: reqBody.timeZone,\n          locale: null,\n          phoneNumber: null,\n          bookingId: null,\n          noShow: null,\n        },\n      ],\n      oneTimePassword: null,\n      smsReminderNumber: null,\n      metadata: {},\n      idempotencyKey: null,\n      userPrimaryEmail: null,\n      description: eventType.description || null,\n      customInputs: null,\n      responses: null,\n      location: bookingLocation,\n      paid: false,\n      cancellationReason: null,\n      rejectionReason: null,\n      dynamicEventSlugRef: null,\n      dynamicGroupSlugRef: null,\n      fromReschedule: null,\n      recurringEventId: null,\n      scheduledJobs: [],\n      rescheduledBy: null,\n      destinationCalendarId: null,\n      reassignReason: null,\n      reassignById: null,\n      rescheduled: false,\n      isRecorded: false,\n      iCalSequence: 0,\n      rating: null,\n      ratingFeedback: null,\n      noShowHost: null,\n      cancelledBy: null,\n      creationSource: CreationSource.WEBAPP,\n      references: [],\n      payment: [],\n      isDryRun: false,\n      paymentRequired: false,\n      paymentUid: undefined,\n      luckyUsers: [],\n      paymentId: undefined,\n      seatReferenceUid: undefined,\n      isShortCircuitedBooking: true,\n      previousBooking: originalRescheduledBooking\n        ? {\n            uid: originalRescheduledBooking.uid,\n            startTime: originalRescheduledBooking.startTime,\n            endTime: originalRescheduledBooking.endTime,\n          }\n        : null,\n    };\n  }\n\n  // For seats, if the booking already exists then we want to add the new attendee to the existing booking\n  if (eventType.seatsPerTimeSlot) {\n    const newBooking = await handleSeats({\n      rescheduleUid,\n      reqBookingUid: reqBody.bookingUid,\n      eventType,\n      evt,\n      invitee,\n      allCredentials,\n      organizerUser,\n      originalRescheduledBooking,\n      bookerEmail,\n      bookerPhoneNumber,\n      tAttendees,\n      bookingSeat,\n      reqUserId: input.userId,\n      reqUserUuid: userUuid,\n      rescheduleReason,\n      reqBodyUser: reqBody.user,\n      noEmail,\n      isConfirmedByDefault,\n      additionalNotes,\n      reqAppsStatus,\n      attendeeLanguage,\n      paymentAppData,\n      fullName,\n      smsReminderNumber,\n      eventTypeInfo,\n      uid,\n      eventTypeId,\n      reqBodyMetadata: reqBody.metadata,\n      subscriberOptions,\n      eventTrigger,\n      responses,\n      rescheduledBy: reqBody.rescheduledBy,\n      isDryRun,\n      traceContext,\n    });\n\n    if (newBooking) {\n      const bookingResponse = {\n        ...newBooking,\n        user: {\n          ...newBooking.user,\n          email: null,\n        },\n        paymentRequired: false,\n        isDryRun: isDryRun,\n        ...(isDryRun ? { troubleshooterData } : {}),\n      };\n      return {\n        ...bookingResponse,\n        ...luckyUserResponse,\n        previousBooking: originalRescheduledBooking\n          ? {\n              uid: originalRescheduledBooking.uid,\n              startTime: originalRescheduledBooking.startTime,\n              endTime: originalRescheduledBooking.endTime,\n            }\n          : null,\n      };\n    } else {\n      // Rescheduling logic for the original seated event was handled in handleSeats\n      // We want to use new booking logic for the new time slot\n      originalRescheduledBooking = null;\n      const updatedEvt = CalendarEventBuilder.fromEvent(evt)\n        ?.withIdentifiers({\n          iCalUID: getICalUID({\n            attendeeId: bookingSeat?.attendeeId,\n          }),\n        })\n        .build();\n\n      evt = updatedEvt;\n    }\n  }\n\n  const changedOrganizer =\n    !!originalRescheduledBooking &&\n    (eventType.schedulingType === SchedulingType.ROUND_ROBIN ||\n      eventType.schedulingType === SchedulingType.COLLECTIVE) &&\n    originalRescheduledBooking.userId !== evt.organizer.id;\n\n  const skipDeleteEventsAndMeetings = changedOrganizer;\n\n  const isBookingRequestedReschedule =\n    !!originalRescheduledBooking &&\n    !!originalRescheduledBooking.rescheduled &&\n    originalRescheduledBooking.status === BookingStatus.CANCELLED;\n\n  if (\n    changedOrganizer &&\n    originalRescheduledBooking &&\n    originalRescheduledBooking?.user?.name &&\n    organizerUser?.name\n  ) {\n    evt.title = updateHostInEventName(\n      originalRescheduledBooking.title,\n      originalRescheduledBooking.user.name,\n      organizerUser.name\n    );\n  }\n\n  let results: EventResult<AdditionalInformation & { url?: string; iCalUID?: string }>[] = [];\n  let referencesToCreate: PartialReference[] = [];\n\n  let booking: CreatedBooking | null = null;\n\n  tracingLogger.debug(\n    \"Going to create booking in DB now\",\n    safeStringify({\n      organizerUser: organizerUser.id,\n      attendeesList: attendeesList.map((guest) => ({ timeZone: guest.timeZone })),\n      requiresConfirmation: evt.requiresConfirmation,\n      isConfirmedByDefault,\n      userReschedulingIsOwner,\n    })\n  );\n\n  let assignmentReason: { reasonEnum: AssignmentReasonEnum; reasonString: string } | undefined;\n\n  try {\n    if (!isDryRun) {\n      booking = await createBooking({\n        uid,\n        rescheduledBy: reqBody.rescheduledBy,\n        reqBody: {\n          user: reqBody.user,\n          metadata: reqBody.metadata,\n          recurringEventId: reqBody.recurringEventId,\n        },\n        eventType: {\n          eventTypeData: eventType,\n          id: eventTypeId,\n          slug: eventTypeSlug,\n          organizerUser,\n          isConfirmedByDefault,\n          paymentAppData,\n        },\n        input: {\n          bookerEmail,\n          rescheduleReason,\n          smsReminderNumber,\n          responses,\n        },\n        evt,\n        originalRescheduledBooking,\n        creationSource: input.bookingData.creationSource,\n        tracking: reqBody.tracking,\n      });\n\n      if (booking?.userId) {\n        const usersRepository = new UsersRepository();\n        await usersRepository.updateLastActiveAt(booking.userId);\n        const organizerUserAvailability = availableUsers.find((user) => user.id === booking?.userId);\n\n        criticalLogger.info(`Booking created`, {\n          bookingUid: booking.uid,\n          selectedCalendarIds: organizerUser.allSelectedCalendars?.map((c) => c.id) ?? [],\n          availabilitySnapshot: organizerUserAvailability?.availabilityData\n            ? formatAvailabilitySnapshot(organizerUserAvailability.availabilityData)\n            : null,\n        });\n      }\n\n      evt = CalendarEventBuilder.fromEvent(evt)\n        .withUid(booking.uid ?? null)\n        .build();\n\n      evt = CalendarEventBuilder.fromEvent(evt)\n        .withOneTimePassword(booking.oneTimePassword ?? null)\n        .build();\n\n      // Add assignment reason to evt for emails\n      if (assignmentReason) {\n        evt = CalendarEventBuilder.fromEvent(evt)\n          .withAssignmentReason({\n            category: getAssignmentReasonCategory(assignmentReason.reasonEnum),\n            details: assignmentReason.reasonString ?? null,\n          })\n          .build();\n      }\n\n      if (booking?.id && eventType.seatsPerTimeSlot) {\n        const currentAttendee = booking.attendees.find(\n          (attendee) =>\n            attendee.email === bookingData.responses.email ||\n            (bookingData.responses.attendeePhoneNumber &&\n              attendee.phoneNumber === bookingData.responses.attendeePhoneNumber)\n        );\n\n        // Save description to bookingSeat\n        const uniqueAttendeeId = uuid();\n        await deps.prismaClient.bookingSeat.create({\n          data: {\n            referenceUid: uniqueAttendeeId,\n            data: {\n              description: additionalNotes,\n              responses,\n            },\n            metadata: reqBody.metadata,\n            booking: {\n              connect: {\n                id: booking.id,\n              },\n            },\n            attendee: {\n              connect: {\n                id: currentAttendee?.id,\n              },\n            },\n          },\n        });\n        evt.attendeeSeatId = uniqueAttendeeId;\n      }\n    } else {\n      const { booking: dryRunBooking, troubleshooterData: _troubleshooterData } = buildDryRunBooking({\n        eventTypeId,\n        organizerUser,\n        eventName,\n        startTime: reqBody.start,\n        endTime: reqBody.end,\n        contactOwnerFromReq,\n        contactOwnerEmail,\n        allHostUsers: users,\n        isManagedEventType,\n      });\n\n      booking = dryRunBooking;\n      troubleshooterData = {\n        ...troubleshooterData,\n        ..._troubleshooterData,\n      };\n    }\n  } catch (_err) {\n    const err = getServerErrorFromUnknown(_err);\n    tracingLogger.error(`Booking ${eventTypeId} failed`, \"Error when saving booking to db\", err.message);\n    if (err.cause && typeof err.cause === \"object\" && \"code\" in err.cause && err.cause.code === \"P2002\") {\n      throw new HttpError({\n        statusCode: 409,\n        message: ErrorCode.BookingConflict,\n      });\n    }\n    throw err;\n  }\n\n  // After polling videoBusyTimes, credentials might have been changed due to refreshment, so query them again.\n  const credentials = await refreshCredentials(allCredentials);\n  const apps = eventTypeAppMetadataOptionalSchema.parse(eventType?.metadata?.apps);\n  const eventManager =\n    !isDryRun && !skipCalendarSyncTaskCreation\n      ? new EventManager({ ...organizerUser, credentials }, apps)\n      : buildDryRunEventManager();\n\n  let videoCallUrl;\n\n  // this is the actual rescheduling logic\n  if (!eventType.seatsPerTimeSlot && originalRescheduledBooking?.uid) {\n    tracingLogger.silly(\"Rescheduling booking\", originalRescheduledBooking.uid);\n    evt = CalendarEventBuilder.fromEvent(evt)\n      .withVideoCallDataFromReferences(originalRescheduledBooking.references)\n      .build();\n    evt.rescheduledBy = reqBody.rescheduledBy;\n\n    // If organizer is changed in RR event then we need to delete the previous host destination calendar events\n    const previousHostDestinationCalendar = originalRescheduledBooking?.destinationCalendar\n      ? [originalRescheduledBooking?.destinationCalendar]\n      : [];\n\n    if (changedOrganizer) {\n      // location might changed and will be new created in eventManager.create (organizer default location)\n      evt.videoCallData = undefined;\n      // To prevent \"The requested identifier already exists\" error while updating event, we need to remove iCalUID\n      evt.iCalUID = undefined;\n      evt.hasOrganizerChanged = true;\n    }\n\n    if (changedOrganizer && originalRescheduledBooking?.user) {\n      const originalHostCredentials = await getAllCredentialsIncludeServiceAccountKey(\n        originalRescheduledBooking.user,\n        eventType\n      );\n      const refreshedOriginalHostCredentials = await refreshCredentials(originalHostCredentials);\n\n      // Create EventManager with original host's credentials for deletion operations\n      const originalHostEventManager = new EventManager(\n        { ...originalRescheduledBooking.user, credentials: refreshedOriginalHostCredentials },\n        apps\n      );\n      tracingLogger.debug(\"RescheduleOrganizerChanged: Deleting Event and Meeting for previous booking\");\n      // Create deletion event with original host's organizer info and original booking properties\n      const deletionEvent = {\n        ...evt,\n        organizer: {\n          id: originalRescheduledBooking.user.id,\n          name: originalRescheduledBooking.user.name || \"\",\n          email: originalRescheduledBooking.user.email,\n          username: originalRescheduledBooking.user.username || undefined,\n          timeZone: originalRescheduledBooking.user.timeZone,\n          language: { translate: tOrganizer, locale: originalRescheduledBooking.user.locale ?? \"en\" },\n          timeFormat: getTimeFormatStringFromUserTimeFormat(originalRescheduledBooking.user.timeFormat),\n        },\n        destinationCalendar: previousHostDestinationCalendar,\n        // Override with original booking properties used by deletion operations\n        startTime: originalRescheduledBooking.startTime.toISOString(),\n        endTime: originalRescheduledBooking.endTime.toISOString(),\n        uid: originalRescheduledBooking.uid,\n        location: originalRescheduledBooking.location,\n        responses: originalRescheduledBooking.responses\n          ? (originalRescheduledBooking.responses as CalEventResponses)\n          : evt.responses,\n      };\n\n      if (!skipCalendarSyncTaskCreation) {\n        await originalHostEventManager.deleteEventsAndMeetings({\n          event: deletionEvent,\n          bookingReferences: originalRescheduledBooking.references,\n        });\n      }\n    }\n    // This gets overridden when updating the event - to check if notes have been hidden or not. We just reset this back\n    // to the default description when we are sending the emails.\n    evt.description = eventType.description;\n\n    const updateManager = !skipCalendarSyncTaskCreation\n      ? await eventManager.reschedule(\n          evt,\n          originalRescheduledBooking.uid,\n          undefined,\n          changedOrganizer,\n          previousHostDestinationCalendar,\n          isBookingRequestedReschedule,\n          skipDeleteEventsAndMeetings\n        )\n      : placeholderCreatedEvent;\n\n    results = updateManager.results;\n    referencesToCreate = updateManager.referencesToCreate;\n\n    videoCallUrl = evt.videoCallData?.url ? evt.videoCallData.url : null;\n\n    // This gets overridden when creating the event - to check if notes have been hidden or not. We just reset this back\n    // to the default description when we are sending the emails.\n    evt.description = eventType.description;\n\n    const { metadata: videoMetadata, videoCallUrl: _videoCallUrl } = getVideoCallDetails({\n      results,\n    });\n\n    let metadata: AdditionalInformation = {};\n    metadata = videoMetadata;\n    videoCallUrl = _videoCallUrl;\n\n    const isThereAnIntegrationError = results?.some((res) => !res.success);\n\n    if (isThereAnIntegrationError) {\n      const error = {\n        errorCode: \"BookingReschedulingMeetingFailed\",\n        message: \"Booking Rescheduling failed\",\n      };\n\n      tracingLogger.error(\n        `EventManager.reschedule failure in some of the integrations ${organizerUser.username}`,\n        safeStringify({ error, results })\n      );\n    } else {\n      if (results.length) {\n        // Handle Google Meet results\n        // We use the original booking location since the evt location changes to daily\n        if (bookingLocation === MeetLocationType) {\n          const googleMeetResult = {\n            appName: GoogleMeetMetadata.name,\n            type: \"conferencing\",\n            uid: results[0].uid,\n            originalEvent: results[0].originalEvent,\n          };\n\n          // Find index of google_calendar inside createManager.referencesToCreate\n          const googleCalIndex = updateManager.referencesToCreate.findIndex(\n            (ref) => ref.type === \"google_calendar\"\n          );\n          const googleCalResult = results[googleCalIndex];\n\n          if (!googleCalResult) {\n            tracingLogger.warn(\"Google Calendar not installed but using Google Meet as location\");\n            results.push({\n              ...googleMeetResult,\n              success: false,\n              calWarnings: [tOrganizer(\"google_meet_warning\")],\n            });\n          }\n\n          const googleHangoutLink = Array.isArray(googleCalResult?.updatedEvent)\n            ? googleCalResult.updatedEvent[0]?.hangoutLink\n            : (googleCalResult?.updatedEvent?.hangoutLink ?? googleCalResult?.createdEvent?.hangoutLink);\n\n          if (googleHangoutLink) {\n            results.push({\n              ...googleMeetResult,\n              success: true,\n            });\n\n            // Add google_meet to referencesToCreate in the same index as google_calendar\n            updateManager.referencesToCreate[googleCalIndex] = {\n              ...updateManager.referencesToCreate[googleCalIndex],\n              meetingUrl: googleHangoutLink,\n            };\n\n            // Also create a new referenceToCreate with type video for google_meet\n            updateManager.referencesToCreate.push({\n              type: \"google_meet_video\",\n              meetingUrl: googleHangoutLink,\n              uid: googleCalResult.uid,\n              credentialId: updateManager.referencesToCreate[googleCalIndex].credentialId,\n            });\n          } else if (googleCalResult && !googleHangoutLink) {\n            results.push({\n              ...googleMeetResult,\n              success: false,\n            });\n          }\n        }\n        const createdOrUpdatedEvent = Array.isArray(results[0]?.updatedEvent)\n          ? results[0]?.updatedEvent[0]\n          : (results[0]?.updatedEvent ?? results[0]?.createdEvent);\n        metadata.hangoutLink = createdOrUpdatedEvent?.hangoutLink;\n        metadata.conferenceData = createdOrUpdatedEvent?.conferenceData;\n        metadata.entryPoints = createdOrUpdatedEvent?.entryPoints;\n        evt.appsStatus = handleAppsStatus(results, booking, reqAppsStatus);\n        videoCallUrl =\n          metadata.hangoutLink ||\n          createdOrUpdatedEvent?.url ||\n          organizerOrFirstDynamicGroupMemberDefaultLocationUrl ||\n          getVideoCallUrlFromCalEvent(evt) ||\n          videoCallUrl;\n      }\n\n      const calendarResult = results.find((result) => result.type.includes(\"_calendar\"));\n\n      evt.iCalUID = Array.isArray(calendarResult?.updatedEvent)\n        ? calendarResult?.updatedEvent[0]?.iCalUID\n        : calendarResult?.updatedEvent?.iCalUID || undefined;\n    }\n\n    evt.appsStatus = handleAppsStatus(results, booking, reqAppsStatus);\n\n    if (!noEmail && isConfirmedByDefault && !isDryRun) {\n      await emailsAndSmsHandler.send({\n        action: BookingActionMap.rescheduled,\n        data: {\n          evt,\n          eventType,\n          additionalInformation: metadata,\n          additionalNotes,\n          iCalUID,\n          originalRescheduledBooking,\n          rescheduleReason,\n          isRescheduledByBooker: reqBody.rescheduledBy === bookerEmail,\n          users,\n          changedOrganizer,\n        },\n      });\n      bookingEmailsAndSmsTaskerAction = BookingActionMap.rescheduled;\n    }\n    // If it's not a reschedule, doesn't require confirmation and there's no price,\n    // Create a booking\n  } else if (isConfirmedByDefault) {\n    const shouldSkipCalendarEvents = !areCalendarEventsEnabled || skipCalendarSyncTaskCreation;\n    const createManager = await eventManager.create(evt, { skipCalendarEvent: shouldSkipCalendarEvents });\n    if (evt.location) {\n      booking.location = evt.location;\n    }\n    // This gets overridden when creating the event - to check if notes have been hidden or not. We just reset this back\n    // to the default description when we are sending the emails.\n    evt.description = eventType.description;\n\n    results = createManager.results;\n    referencesToCreate = createManager.referencesToCreate;\n    videoCallUrl = evt.videoCallData?.url ? evt.videoCallData.url : null;\n\n    if (results.length > 0 && results.every((res) => !res.success)) {\n      const error = {\n        errorCode: \"BookingCreatingMeetingFailed\",\n        message: \"Booking failed\",\n      };\n\n      tracingLogger.error(\n        `EventManager.create failure in some of the integrations ${organizerUser.username}`,\n        safeStringify({ error, results })\n      );\n    } else {\n      const additionalInformation: AdditionalInformation = {};\n\n      if (results.length) {\n        // Handle Google Meet results\n        // We use the original booking location since the evt location changes to daily\n        if (bookingLocation === MeetLocationType) {\n          const googleMeetResult = {\n            appName: GoogleMeetMetadata.name,\n            type: \"conferencing\",\n            uid: results[0].uid,\n            originalEvent: results[0].originalEvent,\n          };\n\n          // Find index of google_calendar inside createManager.referencesToCreate\n          const googleCalIndex = createManager.referencesToCreate.findIndex(\n            (ref) => ref.type === \"google_calendar\"\n          );\n          const googleCalResult = results[googleCalIndex];\n\n          if (!googleCalResult) {\n            tracingLogger.warn(\"Google Calendar not installed but using Google Meet as location\");\n            results.push({\n              ...googleMeetResult,\n              success: false,\n              calWarnings: [tOrganizer(\"google_meet_warning\")],\n            });\n          }\n\n          if (googleCalResult?.createdEvent?.hangoutLink) {\n            results.push({\n              ...googleMeetResult,\n              success: true,\n            });\n\n            // Add google_meet to referencesToCreate in the same index as google_calendar\n            createManager.referencesToCreate[googleCalIndex] = {\n              ...createManager.referencesToCreate[googleCalIndex],\n              meetingUrl: googleCalResult.createdEvent.hangoutLink,\n            };\n\n            // Also create a new referenceToCreate with type video for google_meet\n            createManager.referencesToCreate.push({\n              type: \"google_meet_video\",\n              meetingUrl: googleCalResult.createdEvent.hangoutLink,\n              uid: googleCalResult.uid,\n              credentialId: createManager.referencesToCreate[googleCalIndex].credentialId,\n            });\n          } else if (googleCalResult && !googleCalResult.createdEvent?.hangoutLink) {\n            results.push({\n              ...googleMeetResult,\n              success: false,\n            });\n          }\n        }\n        // TODO: Handle created event metadata more elegantly\n        additionalInformation.hangoutLink = results[0].createdEvent?.hangoutLink;\n        additionalInformation.conferenceData = results[0].createdEvent?.conferenceData;\n        additionalInformation.entryPoints = results[0].createdEvent?.entryPoints;\n        evt.appsStatus = handleAppsStatus(results, booking, reqAppsStatus);\n        videoCallUrl =\n          additionalInformation.hangoutLink ||\n          organizerOrFirstDynamicGroupMemberDefaultLocationUrl ||\n          videoCallUrl;\n\n        if (!isDryRun && evt.iCalUID !== booking.iCalUID) {\n          // The eventManager could change the iCalUID. At this point we can update the DB record\n          await deps.prismaClient.booking.update({\n            where: {\n              id: booking.id,\n            },\n            data: {\n              iCalUID: evt.iCalUID || booking.iCalUID,\n            },\n          });\n        }\n      }\n      if (!noEmail) {\n        if (!isDryRun && !(eventType.seatsPerTimeSlot && rescheduleUid)) {\n          await emailsAndSmsHandler.send({\n            action: BookingActionMap.confirmed,\n            data: {\n              eventType: {\n                metadata: eventType.metadata,\n                schedulingType: eventType.schedulingType,\n              },\n              eventNameObject,\n              evt,\n              additionalInformation,\n              additionalNotes,\n              customInputs,\n            },\n          });\n          bookingEmailsAndSmsTaskerAction = BookingActionMap.confirmed;\n        }\n      }\n    }\n  } else {\n    // If isConfirmedByDefault is false, then booking can't be considered ACCEPTED and thus EventManager has no role to play. Booking is created as PENDING\n    tracingLogger.debug(\n      `EventManager doesn't need to create or reschedule event for booking ${organizerUser.username}`,\n      safeStringify({\n        calEvent: getPiiFreeCalendarEvent(evt),\n        isConfirmedByDefault,\n        paymentValue: paymentAppData.price,\n      })\n    );\n  }\n\n  const bookingRequiresPayment =\n    !Number.isNaN(paymentAppData.price) &&\n    paymentAppData.price > 0 &&\n    !originalRescheduledBooking?.paid &&\n    !!booking;\n\n  if (!isConfirmedByDefault && noEmail !== true && !bookingRequiresPayment) {\n    tracingLogger.debug(\n      `Emails: Booking ${organizerUser.username} requires confirmation, sending request emails`,\n      safeStringify({\n        calEvent: getPiiFreeCalendarEvent(evt),\n      })\n    );\n    if (!isDryRun) {\n      await emailsAndSmsHandler.send({\n        action: BookingActionMap.requested,\n        data: { evt, attendees: attendeesList, eventType, additionalNotes },\n      });\n      bookingEmailsAndSmsTaskerAction = BookingActionMap.requested;\n    }\n  }\n\n  if (booking.location?.startsWith(\"http\")) {\n    videoCallUrl = booking.location;\n  }\n\n  const metadata = videoCallUrl\n    ? {\n        videoCallUrl: getVideoCallUrlFromCalEvent(evt) || videoCallUrl,\n      }\n    : undefined;\n\n  const isBookingEmailSmsTaskerEnabled = false;\n\n  await this.fireBookingEvents({\n    booking: {\n      ...booking,\n      userEmail: booking.user?.email ?? null,\n    },\n    organizerUser,\n    hashedLink: hasHashedBookingLink ? (reqBody.hashedLink ?? null) : null,\n    isDryRun,\n    bookerEmail,\n    bookerName: fullName,\n    originalRescheduledBooking,\n    isRecurringBooking: !!input.bookingData.allRecurringDates,\n    tracingLogger,\n  });\n\n  const webhookLocation = metadata?.videoCallUrl || evt.location;\n\n  const webhookData: EventPayloadType = {\n    ...evt,\n    ...eventTypeInfo,\n    bookingId: booking?.id,\n    rescheduleId: originalRescheduledBooking?.id || undefined,\n    rescheduleUid,\n    rescheduleStartTime: originalRescheduledBooking?.startTime\n      ? dayjs(originalRescheduledBooking?.startTime).utc().format()\n      : undefined,\n    rescheduleEndTime: originalRescheduledBooking?.endTime\n      ? dayjs(originalRescheduledBooking?.endTime).utc().format()\n      : undefined,\n    metadata: { ...metadata, ...reqBody.metadata },\n    eventTypeId,\n    status: \"ACCEPTED\",\n    smsReminderNumber: booking?.smsReminderNumber || undefined,\n    rescheduledBy: reqBody.rescheduledBy,\n    location: webhookLocation,\n    ...(assignmentReason ? { assignmentReason: [assignmentReason] } : {}),\n  };\n\n  if (bookingRequiresPayment) {\n    tracingLogger.debug(`Booking ${organizerUser.username} requires payment`);\n    // Load credentials.app.categories\n    const credentialPaymentAppCategories = await deps.prismaClient.credential.findMany({\n      where: {\n        ...(paymentAppData.credentialId ? { id: paymentAppData.credentialId } : { userId: organizerUser.id }),\n        app: {\n          categories: {\n            hasSome: [\"payment\"],\n          },\n        },\n      },\n      select: {\n        key: true,\n        appId: true,\n        app: {\n          select: {\n            categories: true,\n            dirName: true,\n          },\n        },\n      },\n    });\n    const eventTypePaymentAppCredential = credentialPaymentAppCategories.find((credential) => {\n      return credential.appId === paymentAppData.appId;\n    });\n\n    if (!eventTypePaymentAppCredential) {\n      throw new HttpError({\n        statusCode: 400,\n        message: \"Missing payment credentials\",\n      });\n    }\n\n    // Convert type of eventTypePaymentAppCredential to appId: EventTypeAppList\n    if (!booking.user) booking.user = organizerUser;\n    const payment = await handlePayment({\n      evt,\n      selectedEventType: {\n        ...eventType,\n        metadata: eventType.metadata\n          ? {\n              ...eventType.metadata,\n              apps: eventType.metadata?.apps as Prisma.JsonValue,\n            }\n          : {},\n      },\n      paymentAppCredentials: eventTypePaymentAppCredential as IEventTypePaymentCredentialType,\n      booking,\n      bookerName: fullName,\n      bookerEmail,\n      bookerPhoneNumber,\n      isDryRun,\n      bookingFields: eventType.bookingFields,\n      locale: language,\n    });\n    const subscriberOptionsPaymentInitiated: GetSubscriberOptions = {\n      userId: organizerUser.id,\n      eventTypeId,\n      triggerEvent: WebhookTriggerEvents.BOOKING_PAYMENT_INITIATED,\n      teamId: null,\n      orgId: null,\n      oAuthClientId: platformClientId,\n    };\n    await handleWebhookTrigger({\n      subscriberOptions: subscriberOptionsPaymentInitiated,\n      eventTrigger: WebhookTriggerEvents.BOOKING_PAYMENT_INITIATED,\n      webhookData: {\n        ...webhookData,\n        paymentId: payment?.id,\n      },\n      isDryRun,\n      traceContext,\n    });\n\n    // TODO: Refactor better so this booking object is not passed\n    // all around and instead the individual fields are sent as args.\n    const bookingResponse = {\n      ...booking,\n      user: {\n        ...booking.user,\n        email: null,\n      },\n      videoCallUrl: metadata?.videoCallUrl,\n      // Ensure seatReferenceUid is properly typed as string | null\n      seatReferenceUid: evt.attendeeSeatId,\n    };\n\n    return {\n      ...bookingResponse,\n      ...luckyUserResponse,\n      message: \"Payment required\",\n      paymentRequired: true,\n      paymentUid: payment?.uid,\n      paymentId: payment?.id,\n      isDryRun,\n      ...(isDryRun ? { troubleshooterData } : {}),\n      previousBooking: originalRescheduledBooking\n        ? {\n            uid: originalRescheduledBooking.uid,\n            startTime: originalRescheduledBooking.startTime,\n            endTime: originalRescheduledBooking.endTime,\n          }\n        : null,\n    };\n  }\n\n  tracingLogger.debug(`Booking ${organizerUser.username} completed`);\n\n  // We are here so, booking doesn't require payment and booking is also created in DB already, through createBooking call\n  if (isConfirmedByDefault) {\n    const subscribersMeetingEnded = await getWebhooks(subscriberOptionsMeetingEnded);\n    const subscribersMeetingStarted = await getWebhooks(subscriberOptionsMeetingStarted);\n\n    const deleteWebhookScheduledTriggerPromises: Promise<unknown>[] = [];\n    const scheduleTriggerPromises = [];\n\n    if (rescheduleUid && originalRescheduledBooking) {\n      //delete all scheduled triggers for meeting ended and meeting started of booking\n      deleteWebhookScheduledTriggerPromises.push(\n        deleteWebhookScheduledTriggers({\n          booking: originalRescheduledBooking,\n          isDryRun,\n        })\n      );\n      deleteWebhookScheduledTriggerPromises.push(\n        cancelNoShowTasksForBooking({\n          bookingUid: originalRescheduledBooking.uid,\n        })\n      );\n    }\n\n    if (booking && booking.status === BookingStatus.ACCEPTED) {\n      const bookingWithCalEventResponses = {\n        ...booking,\n        responses: reqBody.calEventResponses,\n      };\n      for (const subscriber of subscribersMeetingEnded) {\n        scheduleTriggerPromises.push(\n          scheduleTrigger({\n            booking: bookingWithCalEventResponses,\n            subscriberUrl: subscriber.subscriberUrl,\n            subscriber,\n            triggerEvent: WebhookTriggerEvents.MEETING_ENDED,\n            isDryRun,\n          })\n        );\n      }\n\n      for (const subscriber of subscribersMeetingStarted) {\n        scheduleTriggerPromises.push(\n          scheduleTrigger({\n            booking: bookingWithCalEventResponses,\n            subscriberUrl: subscriber.subscriberUrl,\n            subscriber,\n            triggerEvent: WebhookTriggerEvents.MEETING_STARTED,\n            isDryRun,\n          })\n        );\n      }\n    }\n\n    const scheduledTriggerResults = await Promise.allSettled([\n      ...deleteWebhookScheduledTriggerPromises,\n      ...scheduleTriggerPromises,\n    ]);\n    const failures = scheduledTriggerResults.filter((result) => result.status === \"rejected\");\n\n    if (failures.length > 0) {\n      tracingLogger.error(\n        \"Error while scheduling or canceling webhook triggers\",\n        safeStringify({\n          errors: failures.map((f) => f.reason),\n        })\n      );\n    }\n\n    // Send Webhook call if hooked to BOOKING_CREATED & BOOKING_RESCHEDULED\n    await handleWebhookTrigger({\n      subscriberOptions,\n      eventTrigger,\n      webhookData,\n      isDryRun,\n      traceContext,\n    });\n  }\n\n  if (!booking) throw new HttpError({ statusCode: 400, message: \"Booking failed\" });\n\n  try {\n    if (!isDryRun) {\n      await deps.prismaClient.booking.update({\n        where: {\n          uid: booking.uid,\n        },\n        data: {\n          location: evt.location,\n          metadata: { ...(typeof booking.metadata === \"object\" && booking.metadata), ...metadata },\n          references: {\n            createMany: {\n              data: referencesToCreate,\n            },\n          },\n        },\n      });\n    }\n  } catch (error) {\n    tracingLogger.error(\"Error while creating booking references\", JSON.stringify({ error }));\n  }\n\n  // Queue BOOKING_REQUESTED webhook after booking update so consumer fetches booking with location, metadata, references\n  if (booking && booking.status === BookingStatus.PENDING && !isDryRun) {\n    try {\n      await deps.webhookProducer.queueBookingRequestedWebhook({\n        bookingUid: booking.uid,\n        userId: subscriberOptions.userId ?? undefined,\n        eventTypeId: subscriberOptions.eventTypeId ?? undefined,\n        teamId: Array.isArray(subscriberOptions.teamId)\n          ? subscriberOptions.teamId[0]\n          : (subscriberOptions.teamId ?? undefined),\n        orgId: subscriberOptions.orgId ?? undefined,\n        oAuthClientId: platformClientId ?? undefined,\n      });\n    } catch (webhookError) {\n      tracingLogger.error(\n        `Error queueing BOOKING_REQUESTED webhook: bookingId: ${booking.id}, bookingUid: ${booking.uid}`,\n        safeStringify(webhookError)\n      );\n    }\n  }\n\n  const evtWithMetadata = {\n    ...evt,\n    rescheduleReason,\n    metadata,\n    eventType: { slug: eventType.slug, schedulingType: eventType.schedulingType, hosts: eventType.hosts },\n    bookerUrl,\n  };\n\n  try {\n    if (isConfirmedByDefault) {\n      await scheduleNoShowTriggers({\n        booking: {\n          startTime: booking.startTime,\n          id: booking.id,\n          location: booking.location,\n          uid: booking.uid,\n        },\n        triggerForUser: true,\n        organizerUser: { id: organizerUser.id },\n        eventTypeId,\n        teamId: null,\n        orgId: null,\n        isDryRun,\n      });\n    }\n  } catch (error) {\n    tracingLogger.error(\"Error while scheduling no show triggers\", JSON.stringify({ error }));\n  }\n\n  if (!isDryRun) {\n    await handleAnalyticsEvents({\n      credentials: allCredentials,\n      rawBookingData,\n      bookingInfo: {\n        name: fullName,\n        email: bookerEmail,\n        eventName: \"Cal.diy lead\",\n      },\n      isTeamEventType,\n    });\n\n    // Unused until we deploy to trigger.dev production\n    // for now we only enable for cal.com org and we keep our current email system\n    // cal.com org members will see emails in double while we test\n    if (ENABLE_ASYNC_TASKER && !noEmail && isBookingEmailSmsTaskerEnabled) {\n      try {\n        await deps.bookingEmailAndSmsTasker.send({\n          action: bookingEmailsAndSmsTaskerAction,\n          schedulingType: evtWithMetadata.eventType.schedulingType,\n          payload: {\n            bookingId: booking.id,\n            conferenceCredentialId,\n            platformClientId,\n            platformRescheduleUrl,\n            platformCancelUrl,\n            platformBookingUrl,\n            isRescheduledByBooker: reqBody.rescheduledBy === bookerEmail,\n          },\n        });\n      } catch (err) {\n        tracingLogger.error(\"bookingEmailAndSmsTasker error:\", err);\n      }\n    }\n  }\n\n  // TODO: Refactor better so this booking object is not passed\n  // all around and instead the individual fields are sent as args.\n  const bookingResponse = {\n    ...booking,\n    user: {\n      ...booking.user,\n      email: null,\n    },\n    paymentRequired: false,\n  };\n\n  return {\n    ...bookingResponse,\n    ...luckyUserResponse,\n    isDryRun,\n    ...(isDryRun ? { troubleshooterData } : {}),\n    references: referencesToCreate,\n    seatReferenceUid: evt.attendeeSeatId,\n    videoCallUrl: metadata?.videoCallUrl,\n    previousBooking: originalRescheduledBooking\n      ? {\n          uid: originalRescheduledBooking.uid,\n          startTime: originalRescheduledBooking.startTime,\n          endTime: originalRescheduledBooking.endTime,\n        }\n      : null,\n  };\n}",
    "endLine": 2578,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-handler-71962a93c2",
    "sourcePath": "packages/features/bookings/lib/service/RegularBookingService.ts",
    "startLine": 484,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/bookings/lib/service/RegularBookingService.ts#L484-L2578",
    "verifiedSourceHash": "sha256:542b21f0812b2e3af29fed1c1afb697363cf7a25db2aa61437fec830c1971cab"
  },
  {
    "anchorId": "source-repository-health-complexity-getpublicevent-9e25ddc38c",
    "code": "\n// TODO: Convert it to accept a single parameter with structured data\nexport const getPublicEvent = async (\n  username: string,\n  eventSlug: string,\n  isTeamEvent: boolean | undefined,\n  org: string | null,\n  prisma: PrismaClient,\n  fromRedirectOfNonOrgLink: boolean,\n  currentUserId?: number,\n  fetchAllUsers = false\n) => {\n  const usernameList = getUsernameList(username);\n  const orgQuery = org ? getSlugOrRequestedSlug(org) : null;\n  // In case of dynamic group event, we fetch user's data and use the default event.\n  if (usernameList.length > 1) {\n    const usersInOrgContext = await new UserRepository(prisma).findUsersByUsername({\n      usernameList,\n      orgSlug: org,\n    });\n    const users = usersInOrgContext;\n\n    const defaultEvent = getDefaultEvent(eventSlug);\n    let locations = defaultEvent.locations ? (defaultEvent.locations as LocationObject[]) : [];\n\n    // Get the preferred location type from the first user\n    const firstUsersMetadata = userMetadataSchema.parse(users[0].metadata || {});\n    const preferedLocationType = firstUsersMetadata?.defaultConferencingApp;\n\n    if (preferedLocationType?.appSlug) {\n      const foundApp = getAppFromSlug(preferedLocationType.appSlug);\n      const appType = foundApp?.appData?.location?.type;\n      if (appType) {\n        // Replace the location with the preferred location type\n        // This will still be default to daily if the app is not found\n        locations = [{ type: appType, link: preferedLocationType.appLink }] as LocationObject[];\n      }\n    }\n\n    const defaultEventBookerLayouts = {\n      enabledLayouts: [...bookerLayoutOptions],\n      defaultLayout: BookerLayouts.MONTH_VIEW,\n    } as BookerLayoutSettings;\n    const disableBookingTitle = !defaultEvent.isDynamic;\n    const unPublishedOrgUser = users.find((user) => user.profile?.organization?.slug === null);\n\n    let orgDetails: Pick<Team, \"logoUrl\" | \"name\"> | undefined;\n    if (org) {\n      orgDetails = await prisma.team.findFirstOrThrow({\n        where: {\n          slug: org,\n        },\n        select: {\n          logoUrl: true,\n          name: true,\n        },\n      });\n    }\n\n    return {\n      ...defaultEvent,\n      bookingFields: getBookingFieldsWithSystemFields({ ...defaultEvent, disableBookingTitle }),\n      // Only return fields consumed by the booker.\n      subsetOfUsers: users.map((user) => ({\n        name: user.name,\n        username: user.username,\n        avatarUrl: user.avatarUrl,\n        weekStart: user.weekStart,\n        brandColor: user.brandColor,\n        darkBrandColor: user.darkBrandColor,\n        profile: user.profile,\n        bookerUrl: getBookerBaseUrlSync(user.profile?.organization?.slug ?? null),\n      })),\n      users: fetchAllUsers\n        ? users.map((user) => ({\n            name: user.name,\n            username: user.username,\n            avatarUrl: user.avatarUrl,\n            weekStart: user.weekStart,\n            brandColor: user.brandColor,\n            darkBrandColor: user.darkBrandColor,\n            profile: user.profile,\n            bookerUrl: getBookerBaseUrlSync(user.profile?.organization?.slug ?? null),\n          }))\n        : undefined,\n      locations: privacyFilteredLocations(locations),\n      profile: {\n        weekStart: users[0].weekStart,\n        brandColor: users[0].brandColor,\n        darkBrandColor: users[0].darkBrandColor,\n        theme: null,\n        bookerLayouts: bookerLayoutsSchema.parse(\n          firstUsersMetadata?.defaultBookerLayouts || defaultEventBookerLayouts\n        ),\n        ...(orgDetails\n          ? {\n              image: getPlaceholderAvatar(orgDetails?.logoUrl, orgDetails?.name),\n              name: orgDetails?.name,\n              username: org,\n            }\n          : {}),\n      },\n      entity: {\n        considerUnpublished: !fromRedirectOfNonOrgLink && unPublishedOrgUser !== undefined,\n        fromRedirectOfNonOrgLink,\n        orgSlug: org,\n        name: unPublishedOrgUser?.profile?.organization?.name ?? null,\n        teamSlug: null,\n        logoUrl: null,\n        hideProfileLink: false,\n      },\n      isInstantEvent: false,\n      instantMeetingParameters: [],\n      showInstantEventConnectNowModal: false,\n      autoTranslateDescriptionEnabled: false,\n      fieldTranslations: [],\n    };\n  }\n\n  const usersOrTeamQuery = isTeamEvent\n    ? {\n        team: {\n          ...getSlugOrRequestedSlug(username),\n          parent: orgQuery,\n        },\n      }\n    : {\n        users: {\n          some: {\n            ...(orgQuery\n              ? {\n                  profiles: {\n                    some: {\n                      organization: orgQuery,\n                      username: username,\n                    },\n                  },\n                }\n              : {\n                  username,\n                  profiles: { none: {} },\n                }),\n          },\n        },\n        team: null,\n      };\n\n  // In case it's not a group event, it's either a single user or a team, and we query that data.\n  let event = await prisma.eventType.findFirst({\n    where: {\n      slug: eventSlug,\n      ...usersOrTeamQuery,\n    },\n    select: getPublicEventSelect(fetchAllUsers),\n  });\n\n  // If no event was found, check for platform org user event\n  if (!event && !orgQuery) {\n    event = await prisma.eventType.findFirst({\n      where: {\n        slug: eventSlug,\n        users: {\n          some: {\n            username,\n            isPlatformManaged: false,\n            profiles: {\n              some: {\n                organization: {\n                  isPlatform: true,\n                },\n              },\n            },\n          },\n        },\n      },\n      select: getPublicEventSelect(fetchAllUsers),\n    });\n  }\n\n  if (!event) return null;\n\n  const eventMetaData = eventTypeMetaDataSchemaWithTypedApps.parse(event.metadata || {});\n  const teamMetadata = teamMetadataSchema.parse(event.team?.metadata || {});\n  const usersAsHosts = event.hosts.map((host) => host.user);\n\n  // Enrich users in a single batch call\n  const enrichedUsers = await new UserRepository(prisma).enrichUsersWithTheirProfiles(usersAsHosts);\n\n  // Map enriched users back to the hosts\n  const hosts = event.hosts.map((host, index) => ({\n    ...host,\n    user: enrichedUsers[index],\n  }));\n\n  const eventWithUserProfiles = {\n    ...event,\n    owner: event.owner\n      ? await new UserRepository(prisma).enrichUserWithItsProfile({\n          user: event.owner,\n        })\n      : null,\n    subsetOfHosts: hosts,\n    hosts: fetchAllUsers ? hosts : undefined,\n  };\n\n  let users =\n    (await getUsersFromEvent(eventWithUserProfiles, prisma)) ||\n    (await getOwnerFromUsersArray(prisma, event.id));\n\n  if (users === null) {\n    throw new Error(`EventType ${event.id} has no owner or users.`);\n  }\n  //In case the event schedule is not defined ,use the event owner's default schedule\n  if (!eventWithUserProfiles.schedule && eventWithUserProfiles.owner?.defaultScheduleId) {\n    const eventOwnerDefaultSchedule = await prisma.schedule.findUnique({\n      where: {\n        id: eventWithUserProfiles.owner?.defaultScheduleId,\n      },\n      select: {\n        id: true,\n        timeZone: true,\n      },\n    });\n    eventWithUserProfiles.schedule = eventOwnerDefaultSchedule;\n  }\n\n  let orgDetails: Pick<Team, \"logoUrl\" | \"name\"> | undefined | null;\n  if (org) {\n    orgDetails = await prisma.team.findFirst({\n      where: {\n        slug: org,\n        parentId: null,\n      },\n      select: {\n        logoUrl: true,\n        name: true,\n      },\n    });\n  }\n\n  let showInstantEventConnectNowModal = eventWithUserProfiles.isInstantEvent;\n\n  if (eventWithUserProfiles.isInstantEvent && eventWithUserProfiles.instantMeetingSchedule?.id) {\n    const { id, timeZone } = eventWithUserProfiles.instantMeetingSchedule;\n\n    showInstantEventConnectNowModal = await isCurrentlyAvailable({\n      prisma,\n      instantMeetingScheduleId: id,\n      availabilityTimezone: timeZone ?? \"Europe/London\",\n      length: eventWithUserProfiles.length,\n    });\n  }\n  let canViewPrivateTeamMembers = false;\n  if (currentUserId && event.teamId) {\n    const permissionCheckService = new PermissionCheckService();\n    canViewPrivateTeamMembers = await permissionCheckService.checkPermission({\n      userId: currentUserId,\n      teamId: event.teamId,\n      permission: \"team.read\",\n      fallbackRoles: [MembershipRole.ADMIN, MembershipRole.OWNER],\n    });\n\n    if (!canViewPrivateTeamMembers && event.team?.parentId) {\n      canViewPrivateTeamMembers = await permissionCheckService.checkPermission({\n        userId: currentUserId,\n        teamId: event.team.parentId,\n        permission: \"team.read\",\n        fallbackRoles: [MembershipRole.ADMIN, MembershipRole.OWNER],\n      });\n    }\n  }\n\n  if (event.team?.isPrivate && !canViewPrivateTeamMembers) {\n    users = [];\n  }\n\n  return {\n    ...eventWithUserProfiles,\n    bookerLayouts: bookerLayoutsSchema.parse(eventMetaData?.bookerLayouts || null),\n    description: markdownToSafeHTML(eventWithUserProfiles.description),\n    metadata: eventMetaData,\n    customInputs: customInputSchema.array().parse(event.customInputs || []),\n    locations: privacyFilteredLocations((eventWithUserProfiles.locations || []) as LocationObject[]),\n    bookingFields: getBookingFieldsWithSystemFields(event),\n    recurringEvent: isRecurringEvent(eventWithUserProfiles.recurringEvent)\n      ? parseRecurringEvent(event.recurringEvent)\n      : null,\n    // Sets user data on profile object for easier access\n    profile: getProfileFromEvent(eventWithUserProfiles),\n    subsetOfUsers: users,\n    users: fetchAllUsers ? users : undefined,\n    entity: {\n      fromRedirectOfNonOrgLink,\n      considerUnpublished:\n        !fromRedirectOfNonOrgLink &&\n        (eventWithUserProfiles.team?.slug === null ||\n          eventWithUserProfiles.owner?.profile?.organization?.slug === null ||\n          eventWithUserProfiles.team?.parent?.slug === null),\n      orgSlug: org,\n      teamSlug: (eventWithUserProfiles.team?.slug || teamMetadata?.requestedSlug) ?? null,\n      name:\n        (eventWithUserProfiles.owner?.profile?.organization?.name ||\n          eventWithUserProfiles.team?.parent?.name ||\n          eventWithUserProfiles.team?.name) ??\n        null,\n      hideProfileLink: eventWithUserProfiles.team?.hideTeamProfileLink ?? false,\n      ...(orgDetails\n        ? {\n            logoUrl: getPlaceholderAvatar(orgDetails?.logoUrl, orgDetails?.name),\n            name: orgDetails?.name,\n          }\n        : {}),\n    },\n    isDynamic: false,\n    isInstantEvent: eventWithUserProfiles.isInstantEvent,\n    showInstantEventConnectNowModal,\n    instantMeetingParameters: eventWithUserProfiles.instantMeetingParameters,\n    assignAllTeamMembers: event.assignAllTeamMembers,\n    disableCancelling: event.disableCancelling,\n    disableRescheduling: event.disableRescheduling,\n    allowReschedulingCancelledBookings: event.allowReschedulingCancelledBookings,\n    interfaceLanguage: event.interfaceLanguage,\n  };\n};",
    "endLine": 605,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-getpublicevent-9e25ddc38c",
    "sourcePath": "packages/features/eventtypes/lib/getPublicEvent.ts",
    "startLine": 282,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/eventtypes/lib/getPublicEvent.ts#L282-L605",
    "verifiedSourceHash": "sha256:8f91f914c106df088fb94b98d757f16d783abdc8f23eecd803ddd8c0bb63fab8"
  },
  {
    "anchorId": "source-repository-health-complexity-authenticate-5818168e65",
    "code": "  }\n\n  async authenticate(request: ApiAuthGuardRequest) {\n    try {\n      const { params } = request;\n      const oAuthClientSecret = request.get(X_CAL_SECRET_KEY);\n      const oAuthClientId = params.clientId || request.get(X_CAL_CLIENT_ID);\n      const bearerToken = request.get(\"Authorization\")?.replace(\"Bearer \", \"\");\n\n      const allowedMethods = request.allowedAuthMethods;\n      const noSpecificAuthExpected = !allowedMethods || !allowedMethods.length;\n\n      const oAuthAllowed = noSpecificAuthExpected || allowedMethods.includes(\"OAUTH_CLIENT_CREDENTIALS\");\n      const apiKeyAllowed = noSpecificAuthExpected || allowedMethods.includes(\"API_KEY\");\n      const accessTokenAllowed = noSpecificAuthExpected || allowedMethods.includes(\"ACCESS_TOKEN\");\n      const nextAuthAllowed = noSpecificAuthExpected || allowedMethods.includes(\"NEXT_AUTH\");\n      const thirdPartyAccessTokenAllowed =\n        noSpecificAuthExpected || allowedMethods.includes(\"THIRD_PARTY_ACCESS_TOKEN\");\n\n      if (oAuthClientId && oAuthClientSecret && oAuthAllowed) {\n        request.authMethod = AuthMethods[\"OAUTH_CLIENT\"];\n        return await this.authenticateOAuthClient(oAuthClientId, oAuthClientSecret, request);\n      }\n\n      if (bearerToken) {\n        if (!apiKeyAllowed && !accessTokenAllowed && thirdPartyAccessTokenAllowed) {\n          request.authMethod = AuthMethods[\"THIRD_PARTY_ACCESS_TOKEN\"];\n          const result = await this.validateThirdPartyAccessToken(bearerToken, request);\n          if (result.success) {\n            return this.success(this.getSuccessUser(result.data));\n          }\n        }\n\n        if (apiKeyAllowed || accessTokenAllowed) {\n          try {\n            const requestOrigin = request.get(\"Origin\");\n            request.authMethod = isApiKey(bearerToken, this.config.get<string>(\"api.apiKeyPrefix\") ?? \"cal_\")\n              ? AuthMethods[\"API_KEY\"]\n              : AuthMethods[\"ACCESS_TOKEN\"];\n            return await this.authenticateBearerToken(bearerToken, request, requestOrigin);\n          } catch (err) {\n            // failed to validate access token, try to validate third party token\n            if (thirdPartyAccessTokenAllowed && request.authMethod === AuthMethods[\"ACCESS_TOKEN\"]) {\n              request.authMethod = AuthMethods[\"THIRD_PARTY_ACCESS_TOKEN\"];\n              const result = await this.validateThirdPartyAccessToken(bearerToken, request);\n\n              if (result.success) {\n                return this.success(this.getSuccessUser(result.data));\n              }\n            }\n            // token was not third party token, rethrow error from authenticateBearerToken\n            if (err instanceof Error) {\n              return this.error(err);\n            }\n          }\n        }\n\n        throw new UnauthorizedException(`ApiAuthStrategy - Invalid Bearer token`);\n      }\n\n      const nextAuthSecret = this.config.get(\"next.authSecret\", { infer: true });\n      const nextAuthToken = await getToken({ req: request, secret: nextAuthSecret });\n      if (nextAuthToken && nextAuthAllowed) {\n        request.authMethod = AuthMethods[\"NEXT_AUTH\"];\n        return await this.authenticateNextAuth(nextAuthToken, request);\n      }\n\n      const noAuthProvided = !oAuthClientId && !oAuthClientSecret && !bearerToken && !nextAuthToken;\n      const onlyClientIdProvided = !!oAuthClientId && !oAuthClientSecret && !bearerToken && !nextAuthToken;\n      const onlyClientSecretProvided =\n        !oAuthClientId && !!oAuthClientSecret && !bearerToken && !nextAuthToken;\n\n      if (noAuthProvided) {\n        throw new UnauthorizedException(`ApiAuthStrategy - ${NO_AUTH_PROVIDED_MESSAGE}`);\n      }\n\n      if (onlyClientIdProvided) {\n        throw new UnauthorizedException(`ApiAuthStrategy - ${ONLY_CLIENT_ID_PROVIDED_MESSAGE}`);\n      }\n\n      if (onlyClientSecretProvided) {\n        throw new UnauthorizedException(`ApiAuthStrategy - ${ONLY_CLIENT_SECRET_PROVIDED_MESSAGE}`);\n      }\n\n      throw new UnauthorizedException(\n        `ApiAuthStrategy - Invalid authentication method. Please provide one of the allowed methods: ${\n          allowedMethods && allowedMethods.length > 0 ? allowedMethods.join(\", \") : \"Any supported method\"\n        }`\n      );\n    } catch (err) {\n      if (err instanceof Error) {\n        return this.error(err);\n      }\n      return this.error(\n        new InternalServerErrorException(\n          \"ApiAuthStrategy - An error occurred while authenticating the request\"\n        )\n      );\n    }\n  }",
    "endLine": 152,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-authenticate-5818168e65",
    "sourcePath": "apps/api/v2/src/modules/auth/strategies/api-auth/api-auth.strategy.ts",
    "startLine": 53,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/api/v2/src/modules/auth/strategies/api-auth/api-auth.strategy.ts#L53-L152",
    "verifiedSourceHash": "sha256:dd2ec0f297f4875b33ce8d36b746140a8297b997234bc765848d99dfa1b35c25"
  },
  {
    "anchorId": "source-repository-health-complexity-main-442cd69960",
    "code": "}\n\nexport default async function main() {\n  // Calendar apps\n  await createApp(\"apple-calendar\", \"applecalendar\", [\"calendar\"], \"apple_calendar\");\n  if (\n    process.env.BASECAMP3_CLIENT_ID &&\n    process.env.BASECAMP3_CLIENT_SECRET &&\n    process.env.BASECAMP3_USER_AGENT\n  ) {\n    await createApp(\"basecamp3\", \"basecamp3\", [\"other\"], \"basecamp3_other\", {\n      client_id: process.env.BASECAMP3_CLIENT_ID,\n      client_secret: process.env.BASECAMP3_CLIENT_SECRET,\n      user_agent: process.env.BASECAMP3_USER_AGENT,\n    });\n  }\n  await createApp(\"caldav-calendar\", \"caldavcalendar\", [\"calendar\"], \"caldav_calendar\");\n  try {\n    const { client_secret, client_id, redirect_uris } = JSON.parse(\n      process.env.GOOGLE_API_CREDENTIALS || \"\"\n    ).web;\n    await createApp(\"google-calendar\", \"googlecalendar\", [\"calendar\"], \"google_calendar\", {\n      client_id,\n      client_secret,\n      redirect_uris,\n    });\n    await createApp(\"google-meet\", \"googlevideo\", [\"conferencing\"], \"google_video\", {\n      client_id,\n      client_secret,\n      redirect_uris,\n    });\n  } catch (e) {\n    if (e instanceof Error) console.error(\"Error adding google credentials to DB:\", e.message);\n  }\n  if (process.env.MS_GRAPH_CLIENT_ID && process.env.MS_GRAPH_CLIENT_SECRET) {\n    await createApp(\"office365-calendar\", \"office365calendar\", [\"calendar\"], \"office365_calendar\", {\n      client_id: process.env.MS_GRAPH_CLIENT_ID,\n      client_secret: process.env.MS_GRAPH_CLIENT_SECRET,\n    });\n    await createApp(\"msteams\", \"office365video\", [\"conferencing\"], \"office365_video\", {\n      client_id: process.env.MS_GRAPH_CLIENT_ID,\n      client_secret: process.env.MS_GRAPH_CLIENT_SECRET,\n    });\n  }\n  if (\n    process.env.LARK_OPEN_APP_ID &&\n    process.env.LARK_OPEN_APP_SECRET &&\n    process.env.LARK_OPEN_VERIFICATION_TOKEN\n  ) {\n    await createApp(\"lark-calendar\", \"larkcalendar\", [\"calendar\"], \"lark_calendar\", {\n      app_id: process.env.LARK_OPEN_APP_ID,\n      app_secret: process.env.LARK_OPEN_APP_SECRET,\n      open_verification_token: process.env.LARK_OPEN_VERIFICATION_TOKEN,\n    });\n  }\n  // Video apps\n  if (process.env.DAILY_API_KEY) {\n    await createApp(\"daily-video\", \"dailyvideo\", [\"conferencing\"], \"daily_video\", {\n      api_key: process.env.DAILY_API_KEY,\n      scale_plan: process.env.DAILY_SCALE_PLAN,\n    });\n  }\n  if (process.env.TANDEM_CLIENT_ID && process.env.TANDEM_CLIENT_SECRET) {\n    await createApp(\"tandem\", \"tandemvideo\", [\"conferencing\"], \"tandem_video\", {\n      client_id: process.env.TANDEM_CLIENT_ID as string,\n      client_secret: process.env.TANDEM_CLIENT_SECRET as string,\n      base_url: (process.env.TANDEM_BASE_URL as string) || \"https://tandem.chat\",\n    });\n  }\n  if (process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET) {\n    await createApp(\"zoom\", \"zoomvideo\", [\"conferencing\"], \"zoom_video\", {\n      client_id: process.env.ZOOM_CLIENT_ID,\n      client_secret: process.env.ZOOM_CLIENT_SECRET,\n    });\n  }\n  await createApp(\"jitsi\", \"jitsivideo\", [\"conferencing\"], \"jitsi_video\");\n  // Other apps\n  if (process.env.HUBSPOT_CLIENT_ID && process.env.HUBSPOT_CLIENT_SECRET) {\n    await createApp(\"hubspot\", \"hubspot\", [\"crm\"], \"hubspot_other_calendar\", {\n      client_id: process.env.HUBSPOT_CLIENT_ID,\n      client_secret: process.env.HUBSPOT_CLIENT_SECRET,\n    });\n  }\n  if (process.env.SALESFORCE_CONSUMER_KEY && process.env.SALESFORCE_CONSUMER_SECRET) {\n    await createApp(\"salesforce\", \"salesforce\", [\"crm\"], \"salesforce_other_calendar\", {\n      consumer_key: process.env.SALESFORCE_CONSUMER_KEY,\n      consumer_secret: process.env.SALESFORCE_CONSUMER_SECRET,\n    });\n  }\n  if (process.env.ZOHOCRM_CLIENT_ID && process.env.ZOHOCRM_CLIENT_SECRET) {\n    await createApp(\"zohocrm\", \"zohocrm\", [\"crm\"], \"zohocrm_other_calendar\", {\n      client_id: process.env.ZOHOCRM_CLIENT_ID,\n      client_secret: process.env.ZOHOCRM_CLIENT_SECRET,\n    });\n  }\n\n  await createApp(\"wipe-my-cal\", \"wipemycalother\", [\"automation\"], \"wipemycal_other\");\n  if (process.env.GIPHY_API_KEY) {\n    await createApp(\"giphy\", \"giphy\", [\"other\"], \"giphy_other\", {\n      api_key: process.env.GIPHY_API_KEY,\n    });\n  }\n\n  if (process.env.VITAL_API_KEY && process.env.VITAL_WEBHOOK_SECRET) {\n    await createApp(\"vital-automation\", \"vital\", [\"automation\"], \"vital_other\", {\n      mode: process.env.VITAL_DEVELOPMENT_MODE || \"sandbox\",\n      region: process.env.VITAL_REGION || \"us\",\n      api_key: process.env.VITAL_API_KEY,\n      webhook_secret: process.env.VITAL_WEBHOOK_SECRET,\n    });\n  }\n\n  if (process.env.ZAPIER_INVITE_LINK) {\n    await createApp(\"zapier\", \"zapier\", [\"automation\"], \"zapier_automation\", {\n      invite_link: process.env.ZAPIER_INVITE_LINK,\n    });\n  }\n  await createApp(\"make\", \"make\", [\"automation\"], \"make_automation\", {\n    invite_link: \"https://make.com/en/hq/app-invitation/6cb2772b61966508dd8f414ba3b44510\",\n  });\n\n  if (process.env.HUDDLE01_API_TOKEN) {\n    await createApp(\"huddle01\", \"huddle01video\", [\"conferencing\"], \"huddle01_video\", {\n      apiKey: process.env.HUDDLE01_API_TOKEN,\n    });\n  }\n\n  // Payment apps\n  if (\n    process.env.STRIPE_CLIENT_ID &&\n    process.env.STRIPE_PRIVATE_KEY &&\n    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY &&\n    process.env.STRIPE_WEBHOOK_SECRET &&\n    process.env.PAYMENT_FEE_FIXED &&\n    process.env.PAYMENT_FEE_PERCENTAGE\n  ) {\n    await createApp(\"stripe\", \"stripepayment\", [\"payment\"], \"stripe_payment\", {\n      client_id: process.env.STRIPE_CLIENT_ID,\n      client_secret: process.env.STRIPE_PRIVATE_KEY,\n      payment_fee_fixed: Number(process.env.PAYMENT_FEE_FIXED),\n      payment_fee_percentage: Number(process.env.PAYMENT_FEE_PERCENTAGE),\n      public_key: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,\n      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,\n    });\n  }\n\n  if (process.env.CLOSECOM_CLIENT_ID && process.env.CLOSECOM_CLIENT_SECRET) {\n    await createApp(\"closecom\", \"closecom\", [\"crm\"], \"closecom_crm\", {\n      client_id: process.env.CLOSECOM_CLIENT_ID,\n      client_secret: process.env.CLOSECOM_CLIENT_SECRET,\n    });\n  }\n\n  for (const [, app] of Object.entries(appStoreMetadata)) {\n    if (app.isTemplate && process.argv[2] !== \"seed-templates\") {\n      continue;\n    }\n\n    const validatedCategories = app.categories.filter(\n      (category): category is AppCategories => category in AppCategories\n    );\n\n    await createApp(\n      app.slug,\n      app.dirName ?? app.slug,\n      validatedCategories,\n      app.type,\n      undefined,\n      app.isTemplate\n    );\n  }\n}",
    "endLine": 263,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-main-442cd69960",
    "sourcePath": "scripts/seed-app-store.ts",
    "startLine": 92,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/scripts/seed-app-store.ts#L92-L263",
    "verifiedSourceHash": "sha256:afe4f830223ad938ade2231336ba523139e13a842de4f83968f1bee28a57f1fe"
  },
  {
    "anchorId": "source-repository-health-complexity-handler-ade03c41a4",
    "code": "import { NextResponse } from \"next/server\";\n\nexport default async function handler(body: Record<string, string>) {\n  const { email, password, language, token } = signupSchema.parse(body);\n\n  const username = slugify(body.username);\n  const userEmail = email.toLowerCase();\n\n  if (!username) {\n    return NextResponse.json({ message: \"Invalid username\" }, { status: 422 });\n  }\n\n  let foundToken: { id: number; teamId: number | null; expires: Date } | null = null;\n  let correctedUsername = username;\n  if (token) {\n    foundToken = await findTokenByToken({ token });\n    throwIfTokenExpired(foundToken?.expires);\n    correctedUsername = await validateAndGetCorrectedUsernameForTeam({\n      username,\n      email: userEmail,\n      teamId: foundToken?.teamId,\n      isSignup: true,\n    });\n\n    if (foundToken?.teamId) {\n      const existingUser = await prisma.user.findUnique({\n        where: { email: userEmail },\n        select: { invitedTo: true },\n      });\n      if (existingUser && existingUser.invitedTo !== foundToken.teamId) {\n        return NextResponse.json({ message: SIGNUP_ERROR_CODES.USER_ALREADY_EXISTS }, { status: 409 });\n      }\n    }\n  } else {\n    const userValidation = await validateAndGetCorrectedUsernameAndEmail({\n      username,\n      email: userEmail,\n      isSignup: true,\n    });\n    if (!userValidation.isValid) {\n      logger.error(\"User validation failed\", { userValidation });\n      return NextResponse.json({ message: \"Username or email is already taken\" }, { status: 409 });\n    }\n    if (!userValidation.username) {\n      return NextResponse.json({ message: \"Invalid username\" }, { status: 422 });\n    }\n    correctedUsername = userValidation.username;\n  }\n\n  const hashedPassword = await hashPassword(password);\n\n  if (foundToken?.teamId) {\n    const team = await prisma.team.findUnique({\n      where: {\n        id: foundToken.teamId,\n      },\n      include: {\n        parent: {\n          select: {\n            id: true,\n            slug: true,\n            organizationSettings: true,\n          },\n        },\n        organizationSettings: true,\n      },\n    });\n\n    if (team) {\n      const isInviteForATeamInOrganization = !!team.parent;\n      const isCheckingUsernameInGlobalNamespace = !team.isOrganization && !isInviteForATeamInOrganization;\n\n      if (isCheckingUsernameInGlobalNamespace) {\n        const isUsernameAvailable = !(await isUsernameReservedDueToMigration(correctedUsername));\n        if (!isUsernameAvailable) {\n          return NextResponse.json({ message: \"A user exists with that username\" }, { status: 409 });\n        }\n      }\n\n      const organizationId = team.isOrganization ? team.id : (team.parent?.id ?? null);\n\n      const existingUserByUsername = await prisma.user.findFirst({\n        where: {\n          username: correctedUsername,\n          organizationId,\n          NOT: { email: userEmail },\n        },\n        select: { id: true },\n      });\n      if (existingUserByUsername) {\n        return NextResponse.json({ message: SIGNUP_ERROR_CODES.USER_ALREADY_EXISTS }, { status: 409 });\n      }\n\n      let user: { id: number };\n      try {\n        user = await prisma.user.upsert({\n          where: { email: userEmail },\n          update: {\n            username: correctedUsername,\n            emailVerified: new Date(Date.now()),\n            identityProvider: IdentityProvider.CAL,\n            password: {\n              upsert: {\n                create: { hash: hashedPassword },\n                update: { hash: hashedPassword },\n              },\n            },\n            organizationId,\n          },\n          create: {\n            username: correctedUsername,\n            email: userEmail,\n            emailVerified: new Date(Date.now()),\n            identityProvider: IdentityProvider.CAL,\n            password: { create: { hash: hashedPassword } },\n            organizationId,\n          },\n          select: { id: true },\n        });\n      } catch (error) {\n        if (isPrismaError(error) && error.code === \"P2002\") {\n          const target = String(error.meta?.target ?? \"\");\n          if (target.includes(\"email\") || target.includes(\"username\")) {\n            return NextResponse.json({ message: SIGNUP_ERROR_CODES.USER_ALREADY_EXISTS }, { status: 409 });\n          }\n        }\n        throw error;\n      }\n\n      await createOrUpdateMemberships({\n        user,\n        team,\n      });\n\n      // Accept any child team invites for orgs.\n      if (team.parent) {\n        await joinAnyChildTeamOnOrgInvite({\n          userId: user.id,\n          org: team.parent,\n        });\n      }\n    }\n\n    // Cleanup token after use\n    await prisma.verificationToken.delete({\n      where: {\n        id: foundToken.id,\n      },\n    });\n  } else {\n    const isUsernameAvailable = !(await isUsernameReservedDueToMigration(correctedUsername));\n    if (!isUsernameAvailable) {\n      return NextResponse.json({ message: \"A user exists with that username\" }, { status: 409 });\n    }\n    try {\n      await prisma.user.create({\n        data: {\n          username: correctedUsername,\n          email: userEmail,\n          password: { create: { hash: hashedPassword } },\n          identityProvider: IdentityProvider.CAL,\n        },\n        select: { id: true },\n      });\n    } catch (error) {\n      // Fallback for race conditions where user was created between our check and create\n      if (isPrismaError(error) && error.code === \"P2002\") {\n        const target = String(error.meta?.target ?? \"\");\n        if (target.includes(\"email\") || target.includes(\"username\")) {\n          return NextResponse.json({ message: SIGNUP_ERROR_CODES.USER_ALREADY_EXISTS }, { status: 409 });\n        }\n      }\n      throw error;\n    }\n\n    if (process.env.AVATARAPI_USERNAME && process.env.AVATARAPI_PASSWORD) {\n      await prefillAvatar({ email: userEmail });\n    }\n\n    await sendEmailVerification({\n      email: userEmail,\n      username: correctedUsername,\n      language,\n    });\n  }\n\n  return NextResponse.json({ message: \"Created user\" }, { status: 201 });\n}",
    "endLine": 209,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-handler-ade03c41a4",
    "sourcePath": "apps/web/app/api/auth/signup/handlers/selfHostedHandler.ts",
    "startLine": 22,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/app/api/auth/signup/handlers/selfHostedHandler.ts#L22-L209",
    "verifiedSourceHash": "sha256:64411858beb10ffd3c7ed3e1602256b2601740f2c1c8621b4d3a8e4b4e7d2a18"
  },
  {
    "anchorId": "source-repository-health-complexity-getbaseproperties-7b639d0787",
    "code": "}\n\nfunction getBaseProperties(field: InputBookingField): CustomField | SystemField {\n  if (fieldIsSelect(field)) {\n    return {\n      name: field.slug,\n      type: field.type,\n      label: field.label,\n      sources: [\n        {\n          id: \"user\",\n          type: \"user\",\n          label: \"User\",\n          fieldRequired: true,\n        },\n      ],\n      editable: \"user\",\n      required: field.required,\n      disableOnPrefill: !!field.disableOnPrefill,\n      hidden: \"hidden\" in field ? field.hidden : false,\n    };\n  }\n\n  if (fieldIsDefaultSystemLocation(field)) {\n    return {\n      ...systemBeforeFieldLocation,\n      label: field.label,\n    };\n  }\n\n  if (fieldIsDefaultAttendeePhone(field)) {\n    return {\n      ...systemBeforeFieldPhone,\n      required: field.required,\n      hidden: field.hidden,\n      label: field.label,\n      placeholder: field.placeholder,\n      disableOnPrefill: !!field.disableOnPrefill,\n    };\n  }\n\n  if (fieldIsCustomSystemName(field)) {\n    const systemName = structuredClone(systemBeforeFieldName);\n    if (systemName.variantsConfig?.variants?.fullName?.fields?.[0]) {\n      systemName.variantsConfig.variants.fullName.fields[0].label = field.label;\n    }\n\n    if (systemName.variantsConfig?.variants?.fullName?.fields?.[0]) {\n      systemName.variantsConfig.variants.fullName.fields[0].placeholder = field.placeholder;\n    }\n    // note(Lauris): we attach top level label and placeholder for easier access when converting database event type\n    // to v2 response event type even though form builder uses label and placeholder from variantsConfig.\n    systemName.label = field.label;\n    systemName.placeholder = field.placeholder;\n\n    return {\n      ...systemName,\n      disableOnPrefill: !!field.disableOnPrefill,\n    };\n  }\n\n  if (fieldIsCustomSystemNameSplit(field)) {\n    const systemNameSplit = structuredClone(systemBeforeFieldNameSplit);\n\n    const firstNameField = systemNameSplit.variantsConfig?.variants?.firstAndLastName?.fields?.find(\n      (field) => field.name === \"firstName\"\n    );\n    const lastNameField = systemNameSplit.variantsConfig?.variants?.firstAndLastName?.fields?.find(\n      (field) => field.name === \"lastName\"\n    );\n\n    if (firstNameField) {\n      firstNameField.label = field.firstNameLabel || \"\";\n      firstNameField.placeholder = field.firstNamePlaceholder || \"\";\n    }\n\n    if (lastNameField) {\n      lastNameField.label = field.lastNameLabel || \"\";\n      lastNameField.placeholder = field.lastNamePlaceholder || \"\";\n      lastNameField.required = !!field.lastNameRequired;\n    }\n\n    return {\n      ...systemNameSplit,\n      disableOnPrefill: !!field.disableOnPrefill,\n    };\n  }\n\n  if (fieldIsCustomSystemEmail(field)) {\n    return {\n      ...systemBeforeFieldEmail,\n      label: field.label,\n      placeholder: field.placeholder,\n      disableOnPrefill: !!field.disableOnPrefill,\n      required: field.required,\n      hidden: !!field.hidden,\n    };\n  }\n\n  if (fieldIsCustomSystemRescheduleReason(field)) {\n    return {\n      ...systemAfterFieldRescheduleReason,\n      required: !!field.required,\n      hidden: !!field.hidden,\n      label: field.label,\n      placeholder: \"placeholder\" in field ? field.placeholder : undefined,\n      disableOnPrefill: !!field.disableOnPrefill,\n    };\n  }\n\n  if (fieldIsCustomSystemTitle(field)) {\n    return {\n      ...systemAfterFieldTitle,\n      required: !!field.required,\n      hidden: !!field.hidden,\n      label: field.label,\n      placeholder: \"placeholder\" in field ? field.placeholder : undefined,\n      disableOnPrefill: !!field.disableOnPrefill,\n    };\n  }\n\n  if (fieldIsCustomSystemNotes(field)) {\n    return {\n      ...systemAfterFieldNotes,\n      required: !!field.required,\n      hidden: !!field.hidden,\n      label: field.label,\n      placeholder: \"placeholder\" in field ? field.placeholder : undefined,\n      disableOnPrefill: !!field.disableOnPrefill,\n    };\n  }\n\n  if (fieldIsCustomSystemGuests(field)) {\n    return {\n      ...systemAfterFieldGuests,\n      required: !!field.required,\n      hidden: !!field.hidden,\n      label: field.label,\n      placeholder: \"placeholder\" in field ? field.placeholder : undefined,\n      disableOnPrefill: !!field.disableOnPrefill,\n    };\n  }\n\n  if (field.type === \"boolean\") {\n    return {\n      name: field.slug,\n      type: field.type,\n      label: field.label,\n      labelAsSafeHtml: `<p>${field.label}</p>\\n`,\n      sources: [\n        {\n          id: \"user\",\n          type: \"user\",\n          label: \"User\",\n          fieldRequired: true,\n        },\n      ],\n      editable: \"user\",\n      required: !!field.required,\n      disableOnPrefill: !!field.disableOnPrefill,\n      hidden: !!field.hidden,\n    };\n  }\n\n  if (field.type === \"url\") {\n    return {\n      name: field.slug,\n      type: field.type,\n      label: field.label,\n      placeholder: \"placeholder\" in field ? field.placeholder : \"\",\n      labelAsSafeHtml: `<p>${field.label}</p>\\n`,\n      sources: [\n        {\n          id: \"user\",\n          type: \"user\",\n          label: \"User\",\n          fieldRequired: true,\n        },\n      ],\n      editable: \"user\",\n      required: !!field.required,\n      disableOnPrefill: !!field.disableOnPrefill,\n      hidden: !!field.hidden,\n    };\n  }\n\n  return {\n    name: field.slug,\n    type: field.type,\n    label: \"label\" in field ? field.label : \"\",\n    sources: [\n      {\n        id: \"user\",\n        type: \"user\",\n        label: \"User\",\n        fieldRequired: true,\n      },\n    ],\n    editable: \"user\",\n    required: !!field.required,\n    placeholder: field.placeholder,\n    disableOnPrefill: !!field.disableOnPrefill,\n    hidden: !!field.hidden,\n  };\n}",
    "endLine": 255,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-getbaseproperties-7b639d0787",
    "sourcePath": "apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/api-to-internal/booking-fields.ts",
    "startLine": 51,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/api-to-internal/booking-fields.ts#L51-L255",
    "verifiedSourceHash": "sha256:0b575c12c67ce7d538f293716c82e87e38005a29fa259ec1254a146879c08a40"
  },
  {
    "anchorId": "source-repository-health-complexity-duplicatehandler-72a950591f",
    "code": "};\n\nexport const duplicateHandler = async ({ ctx, input }: DuplicateOptions) => {\n  try {\n    const {\n      id: originalEventTypeId,\n      title: newEventTitle,\n      slug: newSlug,\n      description: newDescription,\n      length: newLength,\n    } = input;\n    const eventType = await prisma.eventType.findUnique({\n      where: {\n        id: originalEventTypeId,\n      },\n      include: {\n        customInputs: true,\n        schedule: true,\n        users: {\n          select: {\n            id: true,\n          },\n        },\n        hosts: true,\n        team: true,\n        webhooks: true,\n        hashedLink: true,\n        destinationCalendar: true,\n        calVideoSettings: {\n          select: {\n            disableRecordingForOrganizer: true,\n            disableRecordingForGuests: true,\n            enableAutomaticTranscription: true,\n            enableAutomaticRecordingForOrganizer: true,\n            requireEmailForGuests: true,\n            redirectUrlOnExit: true,\n            disableTranscriptionForGuests: true,\n            disableTranscriptionForOrganizer: true,\n          },\n        },\n      },\n    });\n\n    if (!eventType) {\n      throw new TRPCError({ code: \"NOT_FOUND\" });\n    }\n\n    // Validate user is owner of event type or in the team\n    if (eventType.userId !== ctx.user.id) {\n      if (eventType.teamId) {\n        const isMember = await prisma.membership.findUnique({\n          where: {\n            userId_teamId: {\n              userId: ctx.user.id,\n              teamId: eventType.teamId,\n            },\n          },\n        });\n        if (!isMember) {\n          throw new TRPCError({ code: \"FORBIDDEN\" });\n        }\n      }\n    }\n\n    const {\n      customInputs,\n      users,\n      locations,\n      team,\n      hosts,\n      recurringEvent,\n      bookingLimits,\n      durationLimits,\n      eventTypeColor,\n      customReplyToEmail,\n      metadata,\n      hashedLink,\n      destinationCalendar,\n\n      id: _id,\n\n      webhooks: _webhooks,\n\n      schedule: _schedule,\n      // @ts-expect-error - descriptionAsSafeHTML is added on the fly using a prisma middleware it shouldn't be used to create event type. Such a property doesn't exist on schema\n      descriptionAsSafeHTML: _descriptionAsSafeHTML,\n      secondaryEmailId,\n      instantMeetingScheduleId: _instantMeetingScheduleId,\n      restrictionScheduleId: _restrictionScheduleId,\n      calVideoSettings,\n      ...rest\n    } = eventType;\n\n    const data: Prisma.EventTypeCreateInput = {\n      ...rest,\n      title: newEventTitle,\n      slug: newSlug,\n      description: newDescription,\n      length: newLength,\n      locations: locations ?? undefined,\n      team: team ? { connect: { id: team.id } } : undefined,\n      users: users ? { connect: users.map((user) => ({ id: user.id })) } : undefined,\n      hosts: hosts\n        ? {\n            createMany: {\n              data: hosts.map(({ eventTypeId: _, ...rest }) => rest),\n            },\n          }\n        : undefined,\n      restrictionSchedule: _restrictionScheduleId\n        ? {\n            connect: {\n              id: _restrictionScheduleId,\n            },\n          }\n        : undefined,\n      recurringEvent: recurringEvent || undefined,\n      bookingLimits: bookingLimits ?? undefined,\n      durationLimits: durationLimits ?? undefined,\n      eventTypeColor: eventTypeColor ?? undefined,\n      customReplyToEmail: customReplyToEmail ?? undefined,\n      metadata: metadata === null ? Prisma.DbNull : metadata,\n      bookingFields: eventType.bookingFields === null ? Prisma.DbNull : eventType.bookingFields,\n      rrSegmentQueryValue:\n        eventType.rrSegmentQueryValue === null ? Prisma.DbNull : eventType.rrSegmentQueryValue,\n      assignRRMembersUsingSegment: eventType.assignRRMembersUsingSegment,\n    };\n\n    // Validate the secondary email\n    if (secondaryEmailId) {\n      const secondaryEmail = await prisma.secondaryEmail.findUnique({\n        where: {\n          id: secondaryEmailId,\n          userId: ctx.user.id,\n        },\n      });\n      // Make sure the secondary email id belongs to the current user and its a verified one\n      if (secondaryEmail && secondaryEmail.emailVerified) {\n        data.secondaryEmail = {\n          connect: {\n            id: secondaryEmailId,\n          },\n        };\n      }\n    }\n\n    const eventTypeRepo = new EventTypeRepository(prisma);\n    const newEventType = await eventTypeRepo.create(data);\n\n    // Create custom inputs\n    if (customInputs) {\n      const customInputsData = customInputs.map((customInput) => {\n        const { id: _, options, ...rest } = customInput;\n        return {\n          options: options ?? undefined,\n          ...rest,\n          eventTypeId: newEventType.id,\n        };\n      });\n      await prisma.eventTypeCustomInput.createMany({\n        data: customInputsData,\n      });\n    }\n\n    if (hashedLink.length > 0) {\n      const newHashedLinksData = hashedLink.map((originalLink, index) => ({\n        link: generateHashedLink(\n          `${users[0]?.id ?? newEventType.teamId ?? originalLink.eventTypeId}-${index}`\n        ),\n        eventTypeId: newEventType.id,\n        expiresAt: originalLink.expiresAt,\n        maxUsageCount: originalLink.maxUsageCount,\n      }));\n      await prisma.hashedLink.createMany({\n        data: newHashedLinksData,\n      });\n    }\n\n    if (calVideoSettings) {\n      await CalVideoSettingsRepository.createCalVideoSettings({\n        eventTypeId: newEventType.id,\n        calVideoSettings,\n      });\n    }\n\n    if (destinationCalendar) {\n      await setDestinationCalendarHandler({\n        ctx,\n        input: {\n          ...destinationCalendar,\n          eventTypeId: newEventType.id,\n        },\n      });\n    }\n\n    return {\n      eventType: newEventType,\n    };\n  } catch (error) {\n    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === \"P2002\") {\n      \n      if (Array.isArray(error.meta?.target) && error.meta?.target.includes(\"slug\")) {\n        throw new TRPCError({\n          code: \"CONFLICT\",\n          message: \"duplicate_event_slug_conflict\",\n        });\n      }\n      \n      throw new TRPCError({\n        code: \"CONFLICT\",\n        message: \"Unique constraint violation while creating a duplicate event.\",\n      });\n    }\n    throw new TRPCError({ code: \"INTERNAL_SERVER_ERROR\", message: `Error duplicating event type ${error}` });\n  }\n};",
    "endLine": 233,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-duplicatehandler-72a950591f",
    "sourcePath": "packages/trpc/server/routers/viewer/eventTypes/heavy/duplicate.handler.ts",
    "startLine": 18,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/trpc/server/routers/viewer/eventTypes/heavy/duplicate.handler.ts#L18-L233",
    "verifiedSourceHash": "sha256:415b0a949a659574e61745efa6c44f0378671b718477d3de7cca75a90b3ccbee"
  },
  {
    "anchorId": "source-repository-health-complexity-reschedule-52ce096021",
    "code": "   * @param event\n   */\n  public async reschedule(\n    event: CalendarEvent,\n    rescheduleUid: string,\n    newBookingId?: number,\n    changedOrganizer?: boolean,\n    previousHostDestinationCalendar?: DestinationCalendar[] | null,\n    isBookingRequestedReschedule?: boolean,\n    skipDeleteEventsAndMeetings?: boolean\n  ): Promise<CreateUpdateResult> {\n    const originalEvt = processLocation(event);\n    const evt = cloneDeep(originalEvt);\n    if (!rescheduleUid) {\n      throw new Error(\"You called eventManager.update without an `rescheduleUid`. This should never happen.\");\n    }\n\n    // Get details of existing booking.\n    const booking = await prisma.booking.findUnique({\n      where: {\n        uid: rescheduleUid,\n      },\n      select: {\n        id: true,\n        userId: true,\n        attendees: true,\n        location: true,\n        endTime: true,\n        references: {\n          where: {\n            deleted: null,\n          },\n          // NOTE: id field removed from select as we don't require for deletingMany\n          // but was giving error on recreate for reschedule, probably because promise.all() didn't finished\n          select: {\n            type: true,\n            uid: true,\n            meetingId: true,\n            meetingPassword: true,\n            meetingUrl: true,\n            externalCalendarId: true,\n            credentialId: true,\n          },\n        },\n        destinationCalendar: true,\n        payment: true,\n        eventType: {\n          select: {\n            seatsPerTimeSlot: true,\n            seatsShowAttendees: true,\n            seatsShowAvailabilityCount: true,\n          },\n        },\n      },\n    });\n\n    if (!booking) {\n      throw new Error(\"booking not found\");\n    }\n\n    const results: Array<EventResult<Event>> = [];\n    const updatedBookingReferences: Array<PartialReference> = [];\n    const isLocationChanged = !!evt.location && !!booking.location && evt.location !== booking.location;\n\n    let isDailyVideoRoomExpired = false;\n\n    if (evt.location === \"integrations:daily\") {\n      const originalBookingEndTime = new Date(booking.endTime);\n      const roomExpiryTime = new Date(originalBookingEndTime.getTime() + 14 * 24 * 60 * 60 * 1000);\n      const now = new Date();\n      isDailyVideoRoomExpired = now > roomExpiryTime;\n    }\n\n    const shouldUpdateBookingReferences =\n      !!changedOrganizer || isLocationChanged || !!isBookingRequestedReschedule || isDailyVideoRoomExpired;\n\n    if (evt.requiresConfirmation) {\n      if (!skipDeleteEventsAndMeetings) {\n        log.debug(\"RescheduleRequiresConfirmation: Deleting Event and Meeting for previous booking\");\n        // As the reschedule requires confirmation, we can't update the events and meetings to new time yet. So, just delete them and let it be handled when organizer confirms the booking.\n        await this.deleteEventsAndMeetings({\n          event: {\n            ...event,\n            destinationCalendar: previousHostDestinationCalendar,\n          },\n          bookingReferences: booking.references,\n        });\n      } else {\n        log.debug(\n          \"RescheduleRequiresConfirmation: Skipping deletion of Event and Meeting due to skipDeleteEventsAndMeetings flag\"\n        );\n      }\n    } else {\n      if (changedOrganizer) {\n        if (!skipDeleteEventsAndMeetings) {\n          log.debug(\"RescheduleOrganizerChanged: Deleting Event and Meeting for previous booking\");\n          await this.deleteEventsAndMeetings({\n            event: { ...event, destinationCalendar: previousHostDestinationCalendar },\n            bookingReferences: booking.references,\n          });\n        }\n\n        log.debug(\"RescheduleOrganizerChanged: Creating Event and Meeting for for new booking\");\n        const createdEvent = await this.create(originalEvt);\n        results.push(...createdEvent.results);\n        updatedBookingReferences.push(...createdEvent.referencesToCreate);\n      } else {\n        // If the reschedule doesn't require confirmation, we can \"update\" the events and meetings to new time.\n        if (isLocationChanged || isBookingRequestedReschedule || isDailyVideoRoomExpired) {\n          const updatedLocation = await this.updateLocation(evt, booking);\n          results.push(...updatedLocation.results);\n          updatedBookingReferences.push(...updatedLocation.referencesToCreate);\n        } else {\n          const isDedicated = evt.location ? isDedicatedIntegration(evt.location) : null;\n          // If and only if event type is a dedicated meeting, update the dedicated video meeting.\n          if (isDedicated) {\n            const result = await this.updateVideoEvent(evt, booking);\n            const [updatedEvent] = Array.isArray(result.updatedEvent)\n              ? result.updatedEvent\n              : [result.updatedEvent];\n\n            if (updatedEvent) {\n              evt.videoCallData = updatedEvent;\n              evt.location = updatedEvent.url;\n            }\n            results.push(result);\n          }\n\n          const bookingCalendarReference = booking.references.find((reference) =>\n            reference.type.includes(\"_calendar\")\n          );\n          // There was a case that booking didn't had any reference and we don't want to throw error on function\n          if (bookingCalendarReference) {\n            // Update all calendar events.\n            results.push(...(await this.updateAllCalendarEvents(evt, booking, newBookingId)));\n          }\n        }\n\n        results.push(...(await this.updateAllCRMEvents(evt, booking)));\n      }\n    }\n    const bookingPayment = booking?.payment;\n\n    // Updating all payment to new\n    if (bookingPayment && newBookingId) {\n      const paymentIds = bookingPayment.map((payment) => payment.id);\n      await prisma.payment.updateMany({\n        where: {\n          id: {\n            in: paymentIds,\n          },\n        },\n        data: {\n          bookingId: newBookingId,\n        },\n      });\n    }\n\n    return {\n      results,\n      referencesToCreate: shouldUpdateBookingReferences ? updatedBookingReferences : [...booking.references],\n    };\n  }",
    "endLine": 775,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-reschedule-52ce096021",
    "sourcePath": "packages/features/bookings/lib/EventManager.ts",
    "startLine": 613,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/bookings/lib/EventManager.ts#L613-L775",
    "verifiedSourceHash": "sha256:9993fb9aeeb865a7cce5f1635c04aef73a4617c87f5ae5af24b1bb0f418f30c0"
  },
  {
    "anchorId": "source-repository-health-complexity-main-93206e005a",
    "code": "}\n\nasync function main() {\n  await createUserAndEventType({\n    user: {\n      email: \"delete-me@example.com\",\n      password: \"delete-me\",\n      username: \"delete-me\",\n      name: \"delete-me\",\n    },\n  });\n\n  await createUserAndEventType({\n    user: {\n      email: \"onboarding@example.com\",\n      password: \"onboarding\",\n      username: \"onboarding\",\n      name: \"onboarding\",\n      completedOnboarding: false,\n    },\n  });\n\n  await createUserAndEventType({\n    user: {\n      email: \"free-first-hidden@example.com\",\n      password: \"free-first-hidden\",\n      username: \"free-first-hidden\",\n      name: \"Free First Hidden Example\",\n    },\n    eventTypes: [\n      {\n        title: \"30min\",\n        slug: \"30min\",\n        length: 30,\n        hidden: true,\n      },\n      {\n        title: \"60min\",\n        slug: \"60min\",\n        length: 30,\n      },\n    ],\n  });\n\n  await createUserAndEventType({\n    user: {\n      email: \"pro@example.com\",\n      name: \"Pro Example\",\n      password: \"pro\",\n      username: \"pro\",\n      theme: \"light\",\n    },\n    eventTypes: [\n      {\n        title: \"30min\",\n        slug: \"30min\",\n        length: 30,\n        _bookings: [\n          {\n            uid: uuid(),\n            title: \"30min\",\n            startTime: dayjs().add(1, \"day\").toDate(),\n            endTime: dayjs().add(1, \"day\").add(30, \"minutes\").toDate(),\n          },\n          {\n            uid: uuid(),\n            title: \"30min\",\n            startTime: dayjs().add(2, \"day\").toDate(),\n            endTime: dayjs().add(2, \"day\").add(30, \"minutes\").toDate(),\n            status: BookingStatus.PENDING,\n          },\n          {\n            // hardcode UID so that we can easily test rescheduling in embed\n            uid: \"qm3kwt3aTnVD7vmP9tiT2f\",\n            title: \"30min Seeded Booking\",\n            startTime: dayjs().add(3, \"day\").toDate(),\n            endTime: dayjs().add(3, \"day\").add(30, \"minutes\").toDate(),\n            status: BookingStatus.PENDING,\n          },\n        ],\n      },\n      {\n        title: \"60min\",\n        slug: \"60min\",\n        length: 60,\n      },\n      {\n        title: \"Multiple duration\",\n        slug: \"multiple-duration\",\n        length: 75,\n        metadata: {\n          multipleDuration: [30, 75, 90],\n        },\n      },\n      {\n        title: \"paid\",\n        slug: \"paid\",\n        length: 60,\n        price: 100,\n      },\n      {\n        title: \"In person meeting\",\n        slug: \"in-person\",\n        length: 60,\n        locations: [{ type: \"inPerson\", address: \"London\" }],\n      },\n      {\n        title: \"Zoom Event\",\n        slug: \"zoom\",\n        length: 60,\n        locations: [{ type: zoomMeta.appData?.location?.type }],\n      },\n      {\n        title: \"Daily Event\",\n        slug: \"daily\",\n        length: 60,\n        locations: [{ type: dailyMeta.appData?.location?.type }],\n      },\n      {\n        title: \"Google Meet\",\n        slug: \"google-meet\",\n        length: 60,\n        locations: [{ type: googleMeetMeta.appData?.location?.type }],\n      },\n      {\n        title: \"Yoga class\",\n        slug: \"yoga-class\",\n        length: 30,\n        recurringEvent: { freq: 2, count: 12, interval: 1 },\n        _bookings: [\n          {\n            uid: uuid(),\n            title: \"Yoga class\",\n            recurringEventId: Buffer.from(\"yoga-class\").toString(\"base64\"),\n            startTime: dayjs().add(1, \"day\").toDate(),\n            endTime: dayjs().add(1, \"day\").add(30, \"minutes\").toDate(),\n            status: BookingStatus.ACCEPTED,\n          },\n          {\n            uid: uuid(),\n            title: \"Yoga class\",\n            recurringEventId: Buffer.from(\"yoga-class\").toString(\"base64\"),\n            startTime: dayjs().add(1, \"day\").add(1, \"week\").toDate(),\n            endTime: dayjs().add(1, \"day\").add(1, \"week\").add(30, \"minutes\").toDate(),\n            status: BookingStatus.ACCEPTED,\n          },\n          {\n            uid: uuid(),\n            title: \"Yoga class\",\n            recurringEventId: Buffer.from(\"yoga-class\").toString(\"base64\"),\n            startTime: dayjs().add(1, \"day\").add(2, \"week\").toDate(),\n            endTime: dayjs().add(1, \"day\").add(2, \"week\").add(30, \"minutes\").toDate(),\n            status: BookingStatus.ACCEPTED,\n          },\n          {\n            uid: uuid(),\n            title: \"Yoga class\",\n            recurringEventId: Buffer.from(\"yoga-class\").toString(\"base64\"),\n            startTime: dayjs().add(1, \"day\").add(3, \"week\").toDate(),\n            endTime: dayjs().add(1, \"day\").add(3, \"week\").add(30, \"minutes\").toDate(),\n            status: BookingStatus.ACCEPTED,\n          },\n          {\n            uid: uuid(),\n            title: \"Yoga class\",\n            recurringEventId: Buffer.from(\"yoga-class\").toString(\"base64\"),\n            startTime: dayjs().add(1, \"day\").add(4, \"week\").toDate(),\n            endTime: dayjs().add(1, \"day\").add(4, \"week\").add(30, \"minutes\").toDate(),\n            status: BookingStatus.ACCEPTED,\n          },\n          {\n            uid: uuid(),\n            title: \"Yoga class\",\n            recurringEventId: Buffer.from(\"yoga-class\").toString(\"base64\"),\n            startTime: dayjs().add(1, \"day\").add(5, \"week\").toDate(),\n            endTime: dayjs().add(1, \"day\").add(5, \"week\").add(30, \"minutes\").toDate(),\n            status: BookingStatus.ACCEPTED,\n          },\n          {\n            uid: uuid(),\n            title: \"Seeded Yoga class\",\n            description: \"seeded\",\n            recurringEventId: Buffer.from(\"seeded-yoga-class\").toString(\"base64\"),\n            startTime: dayjs().subtract(4, \"day\").toDate(),\n            endTime: dayjs().subtract(4, \"day\").add(30, \"minutes\").toDate(),\n            status: BookingStatus.ACCEPTED,\n          },\n          {\n            uid: uuid(),\n            title: \"Seeded Yoga class\",\n            description: \"seeded\",\n            recurringEventId: Buffer.from(\"seeded-yoga-class\").toString(\"base64\"),\n            startTime: dayjs().subtract(4, \"day\").add(1, \"week\").toDate(),\n            endTime: dayjs().subtract(4, \"day\").add(1, \"week\").add(30, \"minutes\").toDate(),\n            status: BookingStatus.ACCEPTED,\n          },\n          {\n            uid: uuid(),\n            title: \"Seeded Yoga class\",\n            description: \"seeded\",\n            recurringEventId: Buffer.from(\"seeded-yoga-class\").toString(\"base64\"),\n            startTime: dayjs().subtract(4, \"day\").add(2, \"week\").toDate(),\n            endTime: dayjs().subtract(4, \"day\").add(2, \"week\").add(30, \"minutes\").toDate(),\n            status: BookingStatus.ACCEPTED,\n          },\n          {\n            uid: uuid(),\n            title: \"Seeded Yoga class\",\n            description: \"seeded\",\n            recurringEventId: Buffer.from(\"seeded-yoga-class\").toString(\"base64\"),\n            startTime: dayjs().subtract(4, \"day\").add(3, \"week\").toDate(),\n            endTime: dayjs().subtract(4, \"day\").add(3, \"week\").add(30, \"minutes\").toDate(),\n            status: BookingStatus.ACCEPTED,\n          },\n        ],\n      },\n      {\n        title: \"Tennis class\",\n        slug: \"tennis-class\",\n        length: 60,\n        recurringEvent: { freq: 2, count: 10, interval: 2 },\n        requiresConfirmation: true,\n        _bookings: [\n          {\n            uid: uuid(),\n            title: \"Tennis class\",\n            recurringEventId: Buffer.from(\"tennis-class\").toString(\"base64\"),\n            startTime: dayjs().add(2, \"day\").toDate(),\n            endTime: dayjs().add(2, \"day\").add(60, \"minutes\").toDate(),\n            status: BookingStatus.PENDING,\n          },\n          {\n            uid: uuid(),\n            title: \"Tennis class\",\n            recurringEventId: Buffer.from(\"tennis-class\").toString(\"base64\"),\n            startTime: dayjs().add(2, \"day\").add(2, \"week\").toDate(),\n            endTime: dayjs().add(2, \"day\").add(2, \"week\").add(60, \"minutes\").toDate(),\n            status: BookingStatus.PENDING,\n          },\n          {\n            uid: uuid(),\n            title: \"Tennis class\",\n            recurringEventId: Buffer.from(\"tennis-class\").toString(\"base64\"),\n            startTime: dayjs().add(2, \"day\").add(4, \"week\").toDate(),\n            endTime: dayjs().add(2, \"day\").add(4, \"week\").add(60, \"minutes\").toDate(),\n            status: BookingStatus.PENDING,\n          },\n          {\n            uid: uuid(),\n            title: \"Tennis class\",\n            recurringEventId: Buffer.from(\"tennis-class\").toString(\"base64\"),\n            startTime: dayjs().add(2, \"day\").add(8, \"week\").toDate(),\n            endTime: dayjs().add(2, \"day\").add(8, \"week\").add(60, \"minutes\").toDate(),\n            status: BookingStatus.PENDING,\n          },\n          {\n            uid: uuid(),\n            title: \"Tennis class\",\n            recurringEventId: Buffer.from(\"tennis-class\").toString(\"base64\"),\n            startTime: dayjs().add(2, \"day\").add(10, \"week\").toDate(),\n            endTime: dayjs().add(2, \"day\").add(10, \"week\").add(60, \"minutes\").toDate(),\n            status: BookingStatus.PENDING,\n          },\n        ],\n      },\n    ],\n  });\n\n  await createUserAndEventType({\n    user: {\n      email: \"trial@example.com\",\n      password: \"trial\",\n      username: \"trial\",\n      name: \"Trial Example\",\n    },\n    eventTypes: [\n      {\n        title: \"30min\",\n        slug: \"30min\",\n        length: 30,\n      },\n      {\n        title: \"60min\",\n        slug: \"60min\",\n        length: 60,\n      },\n    ],\n  });\n\n  await createUserAndEventType({\n    user: {\n      email: \"free@example.com\",\n      password: \"free\",\n      username: \"free\",\n      name: \"Free Example\",\n    },\n    eventTypes: [\n      {\n        title: \"30min\",\n        slug: \"30min\",\n        length: 30,\n      },\n      {\n        title: \"60min\",\n        slug: \"60min\",\n        length: 30,\n      },\n    ],\n  });\n\n  await createUserAndEventType({\n    user: {\n      email: \"usa@example.com\",\n      password: \"usa\",\n      username: \"usa\",\n      name: \"USA Timezone Example\",\n      timeZone: \"America/Phoenix\",\n    },\n    eventTypes: [\n      {\n        title: \"30min\",\n        slug: \"30min\",\n        length: 30,\n      },\n    ],\n  });\n\n  const freeUserTeam = await createUserAndEventType({\n    user: {\n      email: \"teamfree@example.com\",\n      password: \"teamfree\",\n      username: \"teamfree\",\n      name: \"Team Free Example\",\n    },\n  });\n\n  const proUserTeam = await createUserAndEventType({\n    user: {\n      email: \"teampro@example.com\",\n      password: \"teampro\",\n      username: \"teampro\",\n      name: \"Team Pro Example\",\n    },\n  });\n\n  const pro2UserTeam = await createUserAndEventType({\n    user: {\n      email: \"teampro2@example.com\",\n      password: \"teampro2\",\n      username: \"teampro2\",\n      name: \"Team Pro Example 2\",\n    },\n  });\n\n  const pro3UserTeam = await createUserAndEventType({\n    user: {\n      email: \"teampro3@example.com\",\n      password: \"teampro3\",\n      username: \"teampro3\",\n      name: \"Team Pro Example 3\",\n    },\n  });\n\n  const pro4UserTeam = await createUserAndEventType({\n    user: {\n      email: \"teampro4@example.com\",\n      password: \"teampro4\",\n      username: \"teampro4\",\n      name: \"Team Pro Example 4\",\n    },\n  });\n\n  const admin = await createUserAndEventType({\n    user: {\n      email: \"admin@example.com\",\n      /** To comply with admin password requirements  */\n      password: \"ADMINadmin2022!\",\n      username: \"admin\",\n      name: \"Admin Example\",\n      role: \"ADMIN\",\n    },\n  });\n\n  const clientId = process.env.SEED_OAUTH2_CLIENT_ID;\n  const clientSecret = process.env.SEED_OAUTH2_CLIENT_SECRET_HASHED;\n\n  if (clientId && clientSecret) {\n    await createOAuthClientForUser(admin.id, {\n      clientId,\n      clientSecret,\n      name: \"atoms examples app oauth 2 client\",\n      purpose: \"test atoms examples app with oauth 2\",\n      redirectUri: \"http://localhost:4321\",\n      websiteUrl: \"http://localhost:4321\",\n      enablePkce: false,\n    });\n  }\n\n  if (process.env.E2E_TEST_CALCOM_QA_EMAIL && process.env.E2E_TEST_CALCOM_QA_PASSWORD) {\n    await createUserAndEventType({\n      user: {\n        email: process.env.E2E_TEST_CALCOM_QA_EMAIL || \"qa@example.com\",\n        password: process.env.E2E_TEST_CALCOM_QA_PASSWORD || \"qa\",\n        username: \"qa\",\n        name: \"QA Example\",\n      },\n      eventTypes: [\n        {\n          title: \"15min\",\n          slug: \"15min\",\n          length: 15,\n        },\n      ],\n      credentials: [\n        process.env.E2E_TEST_CALCOM_QA_GCAL_CREDENTIALS\n          ? {\n              type: \"google_calendar\",\n              key: JSON.parse(process.env.E2E_TEST_CALCOM_QA_GCAL_CREDENTIALS) as Prisma.JsonObject,\n              appId: \"google-calendar\",\n            }\n          : null,\n      ],\n    });\n  }\n\n  await createTeamAndAddUsers(\n    {\n      name: \"Seeded Team\",\n      slug: \"seeded-team\",\n      eventTypes: {\n        createMany: {\n          data: [\n            {\n              title: \"Collective Seeded Team Event\",\n              slug: \"collective-seeded-team-event\",\n              length: 15,\n              schedulingType: \"COLLECTIVE\",\n            },\n            {\n              title: \"Round Robin Seeded Team Event\",\n              slug: \"round-robin-seeded-team-event\",\n              length: 15,\n              schedulingType: \"ROUND_ROBIN\",\n            },\n          ],\n        },\n      },\n      createdAt: new Date(),\n    },\n    [\n      {\n        id: proUserTeam.id,\n        username: proUserTeam.name || \"Unknown\",\n      },\n      {\n        id: freeUserTeam.id,\n        username: freeUserTeam.name || \"Unknown\",\n      },\n      {\n        id: pro2UserTeam.id,\n        username: pro2UserTeam.name || \"Unknown\",\n        role: \"MEMBER\",\n      },\n      {\n        id: pro3UserTeam.id,\n        username: pro3UserTeam.name || \"Unknown\",\n      },\n      {\n        id: pro4UserTeam.id,\n        username: pro4UserTeam.name || \"Unknown\",\n      },\n    ]\n  );\n\n  await createTeamAndAddUsers(\n    {\n      name: \"Seeded Team (Marketing)\",\n      slug: \"seeded-team-marketing\",\n      eventTypes: {\n        createMany: {\n          data: [\n            {\n              title: \"Collective Seeded Team Event\",\n              slug: \"collective-seeded-team-event\",\n              length: 15,\n              schedulingType: \"COLLECTIVE\",\n            },\n            {\n              title: \"Round Robin Seeded Team Event\",\n              slug: \"round-robin-seeded-team-event\",\n              length: 15,\n              schedulingType: \"ROUND_ROBIN\",\n            },\n          ],\n        },\n      },\n      createdAt: new Date(),\n    },\n    [\n      {\n        id: proUserTeam.id,\n        username: proUserTeam.name || \"Unknown\",\n      },\n      {\n        id: freeUserTeam.id,\n        username: freeUserTeam.name || \"Unknown\",\n      },\n      {\n        id: pro2UserTeam.id,\n        username: pro2UserTeam.name || \"Unknown\",\n        role: \"MEMBER\",\n      },\n      {\n        id: pro3UserTeam.id,\n        username: pro3UserTeam.name || \"Unknown\",\n      },\n      {\n        id: pro4UserTeam.id,\n        username: pro4UserTeam.name || \"Unknown\",\n      },\n    ]\n  );\n\n  await createTeamAndAddUsers(\n    {\n      name: \"Seeded Team (Design)\",\n      slug: \"seeded-team-design\",\n      eventTypes: {\n        createMany: {\n          data: [\n            {\n              title: \"Collective Seeded Team Event\",\n              slug: \"collective-seeded-team-event\",\n              length: 15,\n              schedulingType: \"COLLECTIVE\",\n            },\n            {\n              title: \"Round Robin Seeded Team Event\",\n              slug: \"round-robin-seeded-team-event\",\n              length: 15,\n              schedulingType: \"ROUND_ROBIN\",\n            },\n          ],\n        },\n      },\n      createdAt: new Date(),\n    },\n    [\n      {\n        id: proUserTeam.id,\n        username: proUserTeam.name || \"Unknown\",\n      },\n      {\n        id: freeUserTeam.id,\n        username: freeUserTeam.name || \"Unknown\",\n      },\n      {\n        id: pro2UserTeam.id,\n        username: pro2UserTeam.name || \"Unknown\",\n        role: \"MEMBER\",\n      },\n      {\n        id: pro3UserTeam.id,\n        username: pro3UserTeam.name || \"Unknown\",\n      },\n      {\n        id: pro4UserTeam.id,\n        username: pro4UserTeam.name || \"Unknown\",\n      },\n    ]\n  );\n\n  await createOrganizationAndAddMembersAndTeams({\n    org: {\n      orgData: {\n        name: \"Acme Inc\",\n        slug: \"acme\",\n        isOrganization: true,\n        organizationSettings: {\n          isOrganizationVerified: true,\n          orgAutoAcceptEmail: \"acme.com\",\n          isAdminAPIEnabled: true,\n          isAdminReviewed: true,\n        },\n      },\n      members: [\n        {\n          memberData: {\n            email: \"owner1-acme@example.com\",\n            password: {\n              create: {\n                hash: \"owner1-acme\",\n              },\n            },\n            username: \"owner1-acme\",\n            name: \"Owner 1\",\n          },\n          orgMembership: {\n            role: \"OWNER\",\n            accepted: true,\n          },\n          orgProfile: {\n            username: \"owner1\",\n          },\n          inTeams: [\n            {\n              slug: \"team1\",\n              role: \"ADMIN\",\n            },\n          ],\n        },\n        ...Array.from({ length: 10 }, (_, i) => ({\n          memberData: {\n            email: `member${i}-acme@example.com`,\n            password: {\n              create: {\n                hash: `member${i}-acme`,\n              },\n            },\n            username: `member${i}-acme`,\n            name: `Member ${i}`,\n          },\n          orgMembership: {\n            role: MembershipRole.MEMBER,\n            accepted: true,\n          },\n          orgProfile: {\n            username: `member${i}`,\n          },\n          inTeams:\n            i % 2 === 0\n              ? [\n                  {\n                    slug: \"team1\",\n                    role: MembershipRole.MEMBER,\n                  },\n                ]\n              : [],\n        })),\n      ],\n    },\n    teams: [\n      {\n        teamData: {\n          name: \"Team 1\",\n          slug: \"team1\",\n        },\n        nonOrgMembers: [\n          {\n            email: \"non-acme-member-1@example.com\",\n            password: {\n              create: {\n                hash: \"non-acme-member-1\",\n              },\n            },\n            username: \"non-acme-member-1\",\n            name: \"NonAcme Member1\",\n          },\n        ],\n      },\n    ],\n    usersOutsideOrg: [\n      {\n        name: \"Jane Doe\",\n        email: \"jane@acme.com\",\n        username: \"jane-outside-org\",\n      },\n    ],\n  });\n\n  await createOrganizationAndAddMembersAndTeams({\n    org: {\n      orgData: {\n        name: \"Dunder Mifflin\",\n        slug: \"dunder-mifflin\",\n        isOrganization: true,\n        organizationSettings: {\n          isOrganizationVerified: true,\n          orgAutoAcceptEmail: \"dunder-mifflin.com\",\n          isAdminReviewed: true,\n        },\n      },\n      members: [\n        {\n          memberData: {\n            email: \"owner1-dunder@example.com\",\n            password: {\n              create: {\n                hash: \"owner1-dunder\",\n              },\n            },\n            username: \"owner1-dunder\",\n            name: \"Owner 1\",\n          },\n          orgMembership: {\n            role: \"OWNER\",\n            accepted: true,\n          },\n          orgProfile: {\n            username: \"owner1\",\n          },\n          inTeams: [\n            {\n              slug: \"team1\",\n              role: \"ADMIN\",\n            },\n          ],\n        },\n      ],\n    },\n    teams: [\n      {\n        teamData: {\n          name: \"Team 1\",\n          slug: \"team1\",\n        },\n        nonOrgMembers: [\n          {\n            email: \"non-dunder-member-1@example.com\",\n            password: {\n              create: {\n                hash: \"non-dunder-member-1\",\n              },\n            },\n            username: \"non-dunder-member-1\",\n            name: \"NonDunder Member1\",\n          },\n        ],\n      },\n    ],\n    usersOutsideOrg: [\n      {\n        name: \"John Doe\",\n        email: \"john@dunder-mifflin.com\",\n        username: \"john-outside-org\",\n      },\n    ],\n  });\n\n  // Routing forms feature removed - routing form seeding no longer needed\n\n  await ensureAcmeOwnerHasApiKeySeeded();\n  await seedPerHostLocationsInAcmeOrg();\n}",
    "endLine": 1375,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-main-93206e005a",
    "sourcePath": "scripts/seed.ts",
    "startLine": 632,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/scripts/seed.ts#L632-L1375",
    "verifiedSourceHash": "sha256:869aa0c8de7c5c23da001123fbba512198fe77fdc0ff081e9f0a8697f43edc91"
  },
  {
    "anchorId": "source-repository-health-complexity-createcrmevent-b2b25ec7db",
    "code": "};\n\nexport async function createCRMEvent(payload: string): Promise<void> {\n  // All errors thrown from this try catch will be cause a retry\n  try {\n    const parsedPayload = createCRMEventSchema.safeParse(JSON.parse(payload));\n\n    if (!parsedPayload.success) {\n      throw new Error(`malformed payload in createCRMEvent: ${parsedPayload.error}`);\n    }\n    const { bookingUid } = parsedPayload.data;\n\n    const booking = await prisma.booking.findUnique({\n      where: {\n        uid: bookingUid,\n      },\n      include: {\n        user: {\n          select: {\n            name: true,\n            email: true,\n            locale: true,\n            username: true,\n            timeZone: true,\n          },\n        },\n        eventType: {\n          select: {\n            metadata: true,\n          },\n        },\n        references: {\n          select: {\n            type: true,\n          },\n        },\n      },\n    });\n\n    if (!booking) {\n      throw new Error(`booking not found for uid: ${bookingUid}`);\n    }\n\n    if (booking.status !== BookingStatus.ACCEPTED) {\n      log.info(`Booking status is not ACCEPTED`);\n      return;\n    }\n\n    if (!booking.user) {\n      throw new Error(`user not found for uid: ${bookingUid}`);\n    }\n\n    const eventTypeMetadata = EventTypeMetaDataSchema.safeParse(booking.eventType?.metadata);\n\n    if (!eventTypeMetadata.success) {\n      throw new Error(`malformed event type metadata: ${eventTypeMetadata.error}`);\n    }\n\n    const eventTypeAppMetadata = eventTypeMetadata.data?.apps;\n\n    if (!eventTypeAppMetadata) {\n      throw new Error(`event type app metadata not found for booking ${bookingUid}`);\n    }\n\n    const calendarEvent = await buildCalendarEvent(bookingUid);\n\n    const bookingReferencesToCreate: Prisma.BookingReferenceUncheckedCreateInput[] = [];\n    const existingBookingReferences = await prisma.bookingReference.findMany({\n      where: {\n        bookingId: booking.id,\n        deleted: null,\n      },\n    });\n\n    const errorPerApp: Record<AppSlug, UnknownError> = {};\n\n    /** Common shape for parsed app data that may include CRM properties */\n    interface ParsedAppData {\n      appCategories?: string[];\n      enabled?: boolean;\n      credentialId?: number;\n    }\n\n    // Parse apps and collect credential IDs for enabled CRM apps\n    const appInfoMap = new Map<string, { app: ParsedAppData; credentialId: number }>();\n    const credentialIds = new Set<number>();\n\n    for (const appSlug of Object.keys(eventTypeAppMetadata)) {\n      const appData = eventTypeAppMetadata[appSlug as keyof typeof eventTypeAppMetadata];\n      const appDataSchema = appDataSchemas[appSlug as keyof typeof appDataSchemas];\n\n      if (!appData || !appDataSchema) {\n        throw new Error(`Could not find appData or appDataSchema for ${appSlug}`);\n      }\n\n      const appParse = appDataSchema.safeParse(appData);\n\n      if (!appParse.success) {\n        log.error(`Error parsing event type app data for bookingUid ${bookingUid}`, appParse?.error);\n        continue;\n      }\n\n      const app = appParse.data as ParsedAppData;\n      const hasCrmCategory =\n        app.appCategories && app.appCategories.some((category: string) => category === \"crm\");\n\n      if (!app.enabled || !app.credentialId || !hasCrmCategory) {\n        log.info(`Skipping CRM app ${appSlug}`, {\n          enabled: app.enabled,\n          credentialId: app.credentialId,\n          hasCrmCategory,\n        });\n        continue;\n      }\n\n      appInfoMap.set(appSlug, { app, credentialId: app.credentialId });\n      credentialIds.add(app.credentialId);\n    }\n\n    const crmCredentials = await prisma.credential.findMany({\n      where: {\n        id: {\n          in: Array.from(credentialIds),\n        },\n      },\n      include: {\n        user: {\n          select: {\n            email: true,\n          },\n        },\n      },\n    });\n\n    const crmCredentialMap = new Map<number, (typeof crmCredentials)[number]>();\n    for (const credential of crmCredentials) {\n      crmCredentialMap.set(credential.id, credential);\n    }\n    //Find enabled CRM apps for the event type\n    for (const appSlug of Array.from(appInfoMap.keys())) {\n      const { app, credentialId } = appInfoMap.get(appSlug)!;\n      // Try Catch per app to ensure all apps are tried even if any of them throws an error\n      // If we want to retry for an error from this try catch, then that error must be thrown as a RetryableError\n      try {\n        const crmCredential = crmCredentialMap.get(credentialId);\n\n        if (!crmCredential) {\n          throw new Error(`Credential not found for credentialId: ${credentialId}`);\n        }\n\n        const existingBookingReferenceForTheCredential = existingBookingReferences.find(\n          (reference) => reference.credentialId === crmCredential.id\n        );\n\n        if (existingBookingReferenceForTheCredential) {\n          log.info(`Skipping CRM app ${appSlug} as booking reference already exists`, {\n            credentialId: crmCredential.id,\n            bookingReferenceId: existingBookingReferenceForTheCredential.id,\n          });\n          continue;\n        }\n\n        const CrmManager = (await import(\"@calcom/features/crmManager/crmManager\")).default;\n\n        const crm = new CrmManager(crmCredential, app);\n\n        const results = await crm.createEvent(calendarEvent);\n\n        if (results) {\n          bookingReferencesToCreate.push({\n            type: crmCredential.type,\n            uid: results.id,\n            meetingId: results.id,\n            credentialId: crmCredential.id,\n            bookingId: booking.id,\n          });\n        }\n      } catch (error) {\n        errorPerApp[appSlug] = error;\n      }\n    }\n\n    await prisma.bookingReference.createMany({\n      data: bookingReferencesToCreate,\n    });\n\n    handleErrors({ errorPerApp, payload });\n  } catch (error) {\n    const errorMsg = `Error creating crm event: error: ${safeStringify(error)} Data: ${safeStringify({\n      payload,\n    })}`;\n    log.error(`[Will retry] ${errorMsg}`);\n    // Intentional rethrow to trigger retry\n    throw error;\n  }\n}",
    "endLine": 234,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-createcrmevent-b2b25ec7db",
    "sourcePath": "packages/features/tasker/tasks/crm/createCRMEvent.ts",
    "startLine": 39,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/tasker/tasks/crm/createCRMEvent.ts#L39-L234",
    "verifiedSourceHash": "sha256:37ce15767012616c232228f4974ffdb826d6359a8c73fad7c0ec300450057eb8"
  },
  {
    "anchorId": "source-repository-health-complexity-authorizecredentials-79061825b8",
    "code": " * Extracted for testability\n */\nexport async function authorizeCredentials(\n  credentials: Record<\"email\" | \"password\" | \"totpCode\" | \"backupCode\", string> | undefined\n): Promise<User | null> {\n  log.debug(\"CredentialsProvider:credentials:authorize\", safeStringify({ credentials }));\n  if (!credentials) {\n    console.error(`For some reason credentials are missing`);\n    throw new Error(ErrorCode.InternalServerError);\n  }\n\n  const userRepo = new UserRepository(prisma);\n  const user = await userRepo.findByEmailAndIncludeProfilesAndPassword({\n    email: credentials.email,\n  });\n  // Don't leak information about it being username or password that is invalid\n  if (!user) {\n    throw new Error(ErrorCode.IncorrectEmailPassword);\n  }\n\n  // Locked users cannot login\n  if (user.locked) {\n    throw new Error(ErrorCode.UserAccountLocked);\n  }\n\n  await checkRateLimitAndThrowError({\n    identifier: hashEmail(user.email),\n  });\n\n  // Users without a password must use their identity provider (Google/SAML) to login\n  if (!user.password?.hash) {\n    throw new Error(ErrorCode.IncorrectEmailPassword);\n  }\n\n  // Always verify password for users who have one\n  const isCorrectPassword = await verifyPassword(credentials.password, user.password.hash);\n  if (!isCorrectPassword) {\n    throw new Error(ErrorCode.IncorrectEmailPassword);\n  }\n\n  if (user.twoFactorEnabled && credentials.backupCode) {\n    if (!process.env.CALENDSO_ENCRYPTION_KEY) {\n      console.error(\"Missing encryption key; cannot proceed with backup code login.\");\n      throw new Error(ErrorCode.InternalServerError);\n    }\n\n    if (!user.backupCodes) throw new Error(ErrorCode.MissingBackupCodes);\n\n    const backupCodes = JSON.parse(symmetricDecrypt(user.backupCodes, process.env.CALENDSO_ENCRYPTION_KEY));\n\n    // check if user-supplied code matches one\n    const index = backupCodes.indexOf(credentials.backupCode.replaceAll(\"-\", \"\"));\n    if (index === -1) throw new Error(ErrorCode.IncorrectBackupCode);\n\n    // delete verified backup code and re-encrypt remaining\n    backupCodes[index] = null;\n    await prisma.user.update({\n      where: {\n        id: user.id,\n      },\n      data: {\n        backupCodes: symmetricEncrypt(JSON.stringify(backupCodes), process.env.CALENDSO_ENCRYPTION_KEY),\n      },\n    });\n  } else if (user.twoFactorEnabled) {\n    if (!credentials.totpCode) {\n      throw new Error(ErrorCode.SecondFactorRequired);\n    }\n\n    if (!user.twoFactorSecret) {\n      console.error(`Two factor is enabled for user ${user.id} but they have no secret`);\n      throw new Error(ErrorCode.InternalServerError);\n    }\n\n    if (!process.env.CALENDSO_ENCRYPTION_KEY) {\n      console.error(`\"Missing encryption key; cannot proceed with two factor login.\"`);\n      throw new Error(ErrorCode.InternalServerError);\n    }\n\n    const secret = symmetricDecrypt(user.twoFactorSecret, process.env.CALENDSO_ENCRYPTION_KEY);\n    if (secret.length !== 32) {\n      console.error(\n        `Two factor secret decryption failed. Expected key with length 32 but got ${secret.length}`\n      );\n      throw new Error(ErrorCode.InternalServerError);\n    }\n\n    const isValidToken = (await import(\"@calcom/lib/totp\")).totpAuthenticatorCheck(\n      credentials.totpCode,\n      secret\n    );\n    if (!isValidToken) {\n      throw new Error(ErrorCode.IncorrectTwoFactorCode);\n    }\n  }\n  // Check if the user you are logging into has any active teams\n  const hasActiveTeams = checkIfUserBelongsToActiveTeam(user);\n\n  // authentication success- but does it meet the minimum password requirements?\n  const validateRole = (role: UserPermissionRole) => {\n    // User's role is not \"ADMIN\"\n    if (role !== UserPermissionRole.ADMIN) return role;\n    // User's identity provider is not \"CAL\"\n    if (user.identityProvider !== IdentityProvider.CAL) return role;\n\n    if (process.env.NEXT_PUBLIC_IS_E2E) {\n      console.warn(\"E2E testing is enabled, skipping password and 2FA requirements for Admin\");\n      return role;\n    }\n\n    // User's password is valid and two-factor authentication is enabled\n    if (isPasswordValid(credentials.password, false, true) && user.twoFactorEnabled) return role;\n    // Code is running in a development environment\n    if (isENVDev) return role;\n    // By this point it is an ADMIN without valid security conditions\n    return \"INACTIVE_ADMIN\";\n  };\n\n  const role = validateRole(user.role);\n  const baseUser = AdapterUserPresenter.fromCalUser(user, role, hasActiveTeams);\n\n  if (role === \"INACTIVE_ADMIN\") {\n    const passwordValid = isPasswordValid(credentials.password, false, true);\n    const has2FA = user.twoFactorEnabled;\n\n    let reason: \"both\" | \"password\" | \"2fa\";\n\n    if (!passwordValid && !has2FA) {\n      reason = \"both\";\n    } else if (!passwordValid) {\n      reason = \"password\";\n    } else {\n      reason = \"2fa\";\n    }\n\n    return { ...baseUser, inactiveAdminReason: reason };\n  }\n\n  return baseUser;\n}",
    "endLine": 288,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-authorizecredentials-79061825b8",
    "sourcePath": "packages/features/auth/lib/next-auth-options.ts",
    "startLine": 149,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/auth/lib/next-auth-options.ts#L149-L288",
    "verifiedSourceHash": "sha256:633b7f8d71d8ed9921779c07c5fd7915cf2d95268cfd70ff09dee21b537c5ead"
  },
  {
    "anchorId": "source-repository-health-complexity-handler-074ca77b34",
    "code": "import { buildLegacyRequest } from \"@lib/buildLegacyCtx\";\n\nasync function handler(req: NextRequest) {\n  const body = await parseRequestData(req);\n  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });\n\n  if (!session) {\n    return NextResponse.json({ message: \"Not authenticated\" }, { status: 401 });\n  }\n\n  if (!session.user?.id) {\n    console.error(\"Session is missing a user id.\");\n    return NextResponse.json({ error: ErrorCode.InternalServerError }, { status: 500 });\n  }\n\n  await checkRateLimitAndThrowError({\n    rateLimitingType: \"core\",\n    identifier: `api:totp-disable:${session.user.id}`,\n  });\n\n  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { password: true } });\n\n  if (!user) {\n    console.error(`Session references user that no longer exists.`);\n    return NextResponse.json({ message: \"Not authenticated\" }, { status: 401 });\n  }\n\n  if (!user.password?.hash && user.identityProvider === IdentityProvider.CAL) {\n    return NextResponse.json({ error: ErrorCode.UserMissingPassword }, { status: 400 });\n  }\n\n  if (!user.twoFactorEnabled) {\n    return NextResponse.json({ message: \"Two factor disabled\" });\n  }\n\n  if (user.password?.hash && user.identityProvider === IdentityProvider.CAL) {\n    const isCorrectPassword = await verifyPassword(body.password, user.password.hash);\n    if (!isCorrectPassword) {\n      return NextResponse.json({ error: ErrorCode.IncorrectPassword }, { status: 400 });\n    }\n  }\n\n  // If user has 2FA and using backup code\n  if (user.twoFactorEnabled && body.backupCode) {\n    if (!process.env.CALENDSO_ENCRYPTION_KEY) {\n      console.error(\"Missing encryption key; cannot proceed with backup code login.\");\n      throw new Error(ErrorCode.InternalServerError);\n    }\n\n    if (!user.backupCodes) {\n      return NextResponse.json({ error: ErrorCode.MissingBackupCodes }, { status: 400 });\n    }\n\n    const backupCodes = JSON.parse(symmetricDecrypt(user.backupCodes, process.env.CALENDSO_ENCRYPTION_KEY));\n\n    // check if user-supplied code matches one\n    const index = backupCodes.indexOf(body.backupCode.replaceAll(\"-\", \"\"));\n    if (index === -1) {\n      return NextResponse.json({ error: ErrorCode.IncorrectBackupCode }, { status: 400 });\n    }\n\n    // we delete all stored backup codes at the end, no need to do this here\n\n    // if user has 2fa and NOT using backup code, try totp\n  } else if (user.twoFactorEnabled) {\n    if (!body.code) {\n      return NextResponse.json({ error: ErrorCode.SecondFactorRequired }, { status: 400 });\n    }\n\n    if (!user.twoFactorSecret) {\n      console.error(`Two factor is enabled for user ${user.id} but they have no secret`);\n      throw new Error(ErrorCode.InternalServerError);\n    }\n\n    if (!process.env.CALENDSO_ENCRYPTION_KEY) {\n      console.error(\"Missing encryption key; cannot proceed with two factor login.\");\n      throw new Error(ErrorCode.InternalServerError);\n    }\n\n    const secret = symmetricDecrypt(user.twoFactorSecret, process.env.CALENDSO_ENCRYPTION_KEY);\n    if (secret.length !== 32) {\n      console.error(\n        `Two factor secret decryption failed. Expected key with length 32 but got ${secret.length}`\n      );\n      throw new Error(ErrorCode.InternalServerError);\n    }\n\n    // If user has 2fa enabled, check if body.code is correct\n    const isValidToken = totpAuthenticatorCheck(body.code, secret);\n    if (!isValidToken) {\n      return NextResponse.json({ error: ErrorCode.IncorrectTwoFactorCode }, { status: 400 });\n    }\n  }\n\n  // Disable 2FA\n  await prisma.user.update({\n    where: {\n      id: session.user.id,\n    },\n    data: {\n      backupCodes: null,\n      twoFactorEnabled: false,\n      twoFactorSecret: null,\n    },\n  });\n\n  return NextResponse.json({ message: \"Two factor disabled\" });\n}",
    "endLine": 123,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-handler-074ca77b34",
    "sourcePath": "apps/web/app/api/auth/two-factor/totp/disable/route.ts",
    "startLine": 16,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/app/api/auth/two-factor/totp/disable/route.ts#L16-L123",
    "verifiedSourceHash": "sha256:3522d6e8f4e3c1fd93beab689c4c27646322490edac428adfd7304c2056a99eb"
  },
  {
    "anchorId": "source-repository-health-complexity-validate-33e64b8b32",
    "code": "  };\n\n  async validate(bookingFields: { type: string; slug: string }[]) {\n    if (!Array.isArray(bookingFields)) {\n      throw new BadRequestException(`'bookingFields' must be an array.`);\n    }\n\n    if (!bookingFields.length) {\n      throw new BadRequestException(`'bookingFields' must contain at least 1 booking field.`);\n    }\n\n    const slugs: string[] = [];\n    for (const field of bookingFields) {\n      const { type, slug } = field;\n      const fieldNeedsType =\n        slug !== \"title\" &&\n        slug !== \"notes\" &&\n        slug !== \"guests\" &&\n        slug !== \"rescheduleReason\" &&\n        slug !== \"location\";\n\n      if (fieldNeedsType && !type) {\n        throw new BadRequestException(\n          `All booking fields except ones with slug equal to title, notes, guests, rescheduleReason and location must have a 'type' property.`\n        );\n      }\n\n      const fieldNeedsSlug = type !== \"name\" && type !== \"splitName\" && type !== \"email\";\n      if (fieldNeedsSlug && !slug) {\n        throw new BadRequestException(\n          `Each booking field except ones with type equal to name, splitName, email must have a 'slug' property.`\n        );\n      }\n\n      if (slugs.includes(slug)) {\n        throw new BadRequestException(\n          `Duplicate bookingFields slug '${slug}' found. All bookingFields slugs must be unique.`\n        );\n      }\n      if (fieldNeedsSlug) {\n        slugs.push(slug);\n      }\n\n      const ClassType = fieldNeedsType ? this.classMap[type] : this.classMap[slug];\n      if (!ClassType) {\n        throw new BadRequestException(\n          fieldNeedsType\n            ? `Unsupported booking field type '${type}'.`\n            : `Unsupported booking field slug '${slug}'.`\n        );\n      }\n\n      const instance = plainToInstance(ClassType, field);\n      const errors = await validate(instance);\n      if (errors.length > 0) {\n        const message = errors.flatMap((error) => Object.values(error.constraints || {})).join(\", \");\n        throw new BadRequestException(`Validation failed for ${type || slug} booking field: ${message}`);\n      }\n    }\n\n    return true;\n  }",
    "endLine": 995,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-validate-33e64b8b32",
    "sourcePath": "packages/platform/types/event-types/event-types_2024_06_14/inputs/booking-fields.input.ts",
    "startLine": 934,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/platform/types/event-types/event-types_2024_06_14/inputs/booking-fields.input.ts#L934-L995",
    "verifiedSourceHash": "sha256:613bb6614e5ce27e5c6ecd6db83bbe5908959acd638944bdbcd2f6d7a16fbb54"
  },
  {
    "anchorId": "source-repository-health-complexity-cancelattendeeseat-88f20bf126",
    "code": "import type { BookingToDelete } from \"../../handleCancelBooking\";\n\nasync function cancelAttendeeSeat(\n  data: {\n    seatReferenceUid?: string;\n    bookingToDelete: BookingToDelete;\n  },\n  dataForWebhooks: {\n    webhooks: {\n      id: string;\n      subscriberUrl: string;\n      payloadTemplate: string | null;\n      appId: string | null;\n      secret: string | null;\n      version: WebhookVersion;\n    }[];\n    evt: CalendarEvent;\n    eventTypeInfo: EventTypeInfo;\n  },\n  eventTypeMetadata: EventTypeMetadata\n) {\n  const input = bookingCancelAttendeeSeatSchema.safeParse({\n    seatReferenceUid: data.seatReferenceUid,\n  });\n  const { webhooks, evt, eventTypeInfo } = dataForWebhooks;\n  if (!input.success) return;\n  const { seatReferenceUid } = input.data;\n  const bookingToDelete = data.bookingToDelete;\n  if (!bookingToDelete?.attendees.length || bookingToDelete.attendees.length < 2) return;\n\n  if (!bookingToDelete.userId) {\n    throw new HttpError({ statusCode: 400, message: \"User not found\" });\n  }\n\n  const seatReference = bookingToDelete.seatsReferences.find(\n    (reference) => reference.referenceUid === seatReferenceUid\n  );\n\n  if (!seatReference) throw new HttpError({ statusCode: 400, message: \"User not a part of this booking\" });\n\n  await Promise.all([\n    prisma.bookingSeat.delete({\n      where: {\n        referenceUid: seatReferenceUid,\n      },\n    }),\n    prisma.attendee.delete({\n      where: {\n        id: seatReference.attendeeId,\n      },\n    }),\n  ]);\n\n  const attendee = bookingToDelete?.attendees.find((attendee) => attendee.id === seatReference.attendeeId);\n  const bookingToDeleteUser = bookingToDelete.user ?? null;\n  const delegationCredentials = bookingToDeleteUser\n    ? // We fetch delegation credentials with ServiceAccount key as CalendarService instance created later in the flow needs it\n      await getAllDelegationCredentialsForUserIncludeServiceAccountKey({\n        user: { email: bookingToDeleteUser.email, id: bookingToDeleteUser.id },\n      })\n    : [];\n\n  if (attendee) {\n    /* If there are references then we should update them as well */\n\n    const integrationsToUpdate = [];\n\n    for (const reference of bookingToDelete.references) {\n      if (reference.credentialId || reference.delegationCredentialId) {\n        const credential = await getDelegationCredentialOrFindRegularCredential({\n          id: {\n            credentialId: reference.credentialId,\n            delegationCredentialId: reference.delegationCredentialId,\n          },\n          delegationCredentials,\n        });\n\n        if (credential) {\n          const videoCallReference = bookingToDelete.references.find((reference) =>\n            reference.type.includes(\"_video\")\n          );\n\n          if (videoCallReference) {\n            evt.videoCallData = {\n              type: videoCallReference.type,\n              id: videoCallReference.meetingId,\n              password: videoCallReference?.meetingPassword,\n              url: videoCallReference.meetingUrl,\n            };\n          }\n          const updatedEvt = {\n            ...evt,\n            attendees: evt.attendees.filter((evtAttendee) => attendee.email !== evtAttendee.email),\n            calendarDescription: getRichDescription(evt),\n          };\n          if (reference.type.includes(\"_video\") && reference.type !== \"google_meet_video\") {\n            integrationsToUpdate.push(updateMeeting(credential, updatedEvt, reference));\n          }\n          if (reference.type.includes(\"_calendar\")) {\n            const calendar = await getCalendar(credential, \"booking\");\n            if (calendar) {\n              integrationsToUpdate.push(\n                calendar?.updateEvent(reference.uid, updatedEvt, reference.externalCalendarId)\n              );\n            }\n          }\n        }\n      }\n    }\n\n    try {\n      await Promise.all(integrationsToUpdate);\n    } catch {\n      // Shouldn't stop code execution if integrations fail\n      // as integrations was already updated\n    }\n\n    const tAttendees = await getTranslation(attendee.locale ?? \"en\", \"common\");\n\n    await sendCancelledSeatEmailsAndSMS(\n      evt,\n      {\n        ...attendee,\n        language: { translate: tAttendees, locale: attendee.locale ?? \"en\" },\n      },\n      eventTypeMetadata\n    );\n  }\n\n  evt.attendees = attendee\n    ? [\n        {\n          ...attendee,\n          language: {\n            translate: await getTranslation(attendee.locale ?? \"en\", \"common\"),\n            locale: attendee.locale ?? \"en\",\n          },\n        },\n      ]\n    : [];\n\n  const payload: EventPayloadType = {\n    ...evt,\n    ...eventTypeInfo,\n    status: \"CANCELLED\",\n    smsReminderNumber: bookingToDelete.smsReminderNumber || undefined,\n    requestReschedule: false,\n  };\n\n  const promises = webhooks.map((webhook) =>\n    sendPayload(\n      webhook.secret,\n      WebhookTriggerEvents.BOOKING_CANCELLED,\n      new Date().toISOString(),\n      webhook,\n      payload\n    ).catch((e) => {\n      logger.error(\n        `Error executing webhook for event: ${WebhookTriggerEvents.BOOKING_CANCELLED}, URL: ${webhook.subscriberUrl}, bookingId: ${evt.bookingId}, bookingUid: ${evt.uid}`,\n        safeStringify(e)\n      );\n    })\n  );\n  await Promise.all(promises);\n\n  return { success: true };\n}",
    "endLine": 187,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-cancelattendeeseat-88f20bf126",
    "sourcePath": "packages/features/bookings/lib/handleSeats/cancel/cancelAttendeeSeat.ts",
    "startLine": 21,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/bookings/lib/handleSeats/cancel/cancelAttendeeSeat.ts#L21-L187",
    "verifiedSourceHash": "sha256:5195f771490fefe133024f839912616581db50349a2e8cdbca2ac69bdf701410"
  },
  {
    "anchorId": "source-repository-health-complexity-getserversideprops-788303db32",
    "code": "});\n\nexport async function getServerSideProps(context: GetServerSidePropsContext) {\n  const session = await getServerSession({ req: context.req });\n\n  const {\n    uid: bookingUid,\n    seatReferenceUid,\n    rescheduledBy,\n    /**\n     * This is for the case of request-reschedule where the booking is cancelled\n     */\n    allowRescheduleForCancelledBooking,\n  } = querySchema.parse(context.query);\n\n  const coepFlag = context.query[\"flag.coep\"];\n  const {\n    uid,\n    seatReferenceUid: maybeSeatReferenceUid,\n    bookingSeat,\n  } = await maybeGetBookingUidFromSeat(prisma, seatReferenceUid ? seatReferenceUid : bookingUid);\n\n  const booking = await prisma.booking.findUnique({\n    where: {\n      uid,\n    },\n    select: {\n      ...bookingMinimalSelect,\n      userId: true,\n      responses: true,\n      eventType: {\n        select: {\n          users: {\n            select: {\n              username: true,\n            },\n          },\n          slug: true,\n          allowReschedulingPastBookings: true,\n          disableRescheduling: true,\n          allowReschedulingCancelledBookings: true,\n          minimumRescheduleNotice: true,\n          team: {\n            select: {\n              id: true,\n              parentId: true,\n              slug: true,\n            },\n          },\n          seatsPerTimeSlot: true,\n          userId: true,\n          owner: {\n            select: {\n              id: true,\n            },\n          },\n          hosts: {\n            select: {\n              user: {\n                select: {\n                  id: true,\n                },\n              },\n            },\n          },\n        },\n      },\n      dynamicEventSlugRef: true,\n      dynamicGroupSlugRef: true,\n      user: true,\n      status: true,\n    },\n  });\n  const dynamicEventSlugRef = booking?.dynamicEventSlugRef || \"\";\n\n  if (!booking) {\n    return {\n      notFound: true,\n    } as const;\n  }\n  const eventType = booking.eventType ? booking.eventType : getDefaultEvent(dynamicEventSlugRef);\n\n  const userRepo = new UserRepository(prisma);\n  const enrichedBookingUser = booking.user\n    ? await userRepo.enrichUserWithItsProfile({ user: booking.user })\n    : null;\n\n  const eventUrl = await buildEventUrlFromBooking({\n    eventType,\n    dynamicGroupSlugRef: booking.dynamicGroupSlugRef ?? null,\n    profileEnrichedBookingUser: enrichedBookingUser,\n  });\n\n  if (!booking?.eventType && !booking?.dynamicEventSlugRef) {\n    // TODO: Show something in UI to let user know that this booking is not rescheduleable\n    return {\n      notFound: true,\n    } as const;\n  }\n\n  // Check if reschedule should be prevented based on booking status and event type settings\n  const reschedulePreventionRedirectUrl = determineReschedulePreventionRedirect({\n    booking: {\n      uid,\n      status: booking.status,\n      startTime: booking.startTime,\n      endTime: booking.endTime,\n      responses: booking.responses,\n      userId: booking.userId,\n      eventType: {\n        disableRescheduling: !!eventType?.disableRescheduling,\n        allowReschedulingPastBookings: eventType.allowReschedulingPastBookings,\n        allowBookingFromCancelledBookingReschedule: !!eventType.allowReschedulingCancelledBookings,\n        minimumRescheduleNotice: eventType.minimumRescheduleNotice,\n        teamId: eventType.team?.id ?? null,\n      },\n    },\n    eventUrl,\n    forceRescheduleForCancelledBooking: allowRescheduleForCancelledBooking,\n    currentUserId: session?.user?.id ?? null,\n    bookingSeat,\n  });\n\n  if (reschedulePreventionRedirectUrl) {\n    return {\n      redirect: {\n        destination: reschedulePreventionRedirectUrl,\n        permanent: false,\n      },\n    };\n  }\n\n  // if booking event type is for a seated event and no seat reference uid is provided, throw not found\n  if (booking?.eventType?.seatsPerTimeSlot && !maybeSeatReferenceUid) {\n    const userId = session?.user?.id;\n\n    if (!userId && !seatReferenceUid) {\n      return {\n        redirect: {\n          destination: `/auth/login?callbackUrl=/reschedule/${bookingUid}`,\n          permanent: false,\n        },\n      };\n    }\n    const userIsHost = booking?.eventType.hosts.find((host) => {\n      if (host.user.id === userId) return true;\n    });\n\n    const userIsOwnerOfEventType = booking?.eventType.owner?.id === userId;\n\n    if (!userIsHost && !userIsOwnerOfEventType) {\n      return {\n        notFound: true,\n      } as {\n        notFound: true;\n      };\n    }\n  }\n\n  const destinationUrlSearchParams = new URLSearchParams();\n\n  destinationUrlSearchParams.set(\"rescheduleUid\", seatReferenceUid || bookingUid);\n\n  if (allowRescheduleForCancelledBooking) {\n    destinationUrlSearchParams.set(\"allowRescheduleForCancelledBooking\", \"true\");\n  }\n\n  // TODO: I think we should just forward all the query params here including coep flag\n  if (coepFlag) {\n    destinationUrlSearchParams.set(\"flag.coep\", coepFlag as string);\n  }\n\n  const currentUserEmail = rescheduledBy ?? session?.user?.email;\n\n  if (currentUserEmail) {\n    destinationUrlSearchParams.set(\"rescheduledBy\", currentUserEmail);\n  }\n\n  return {\n    redirect: {\n      destination: `${eventUrl}?${destinationUrlSearchParams.toString()}${\n        eventType.seatsPerTimeSlot ? \"&bookingUid=null\" : \"\"\n      }`,\n      permanent: false,\n    },\n  };\n}",
    "endLine": 208,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-getserversideprops-788303db32",
    "sourcePath": "apps/web/lib/reschedule/[uid]/getServerSideProps.ts",
    "startLine": 22,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/lib/reschedule/[uid]/getServerSideProps.ts#L22-L208",
    "verifiedSourceHash": "sha256:e40c1a436ec87fe83b1a685fdfa17f8b07ad6eb3498c85f53d9d242bcdbc3b2c"
  },
  {
    "anchorId": "source-repository-health-complexity-getallrecordingsolderthan6months-1f76292bbf",
    "code": "}\n\nasync function getAllRecordingsOlderThan6Months(): Promise<Recording[]> {\n  const apiKey = process.env.DAILY_API_KEY;\n\n  if (!apiKey) {\n    console.error(\"DAILY_API_KEY environment variable is required\");\n    process.exit(1);\n  }\n\n  const baseUrl = \"https://api.daily.co/v1/recordings\";\n  const allRecordings: Recording[] = [];\n  const limit = 100;\n\n  // Calculate date 6 months ago\n  const cutoffDate = new Date();\n  cutoffDate.setUTCMonth(cutoffDate.getUTCMonth() - 6);\n  cutoffDate.setUTCHours(0, 0, 0, 0);\n  const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);\n\n  console.log(\n    `Fetching all recordings older than 6 months (before ${\n      cutoffDate.toISOString().split(\"T\")[0]\n    }, timestamp: ${cutoffTimestamp})...`\n  );\n\n  let hasMoreRecordings = true;\n  let requestCount = 0;\n  const startTime = Date.now();\n  let endingBefore = \"OLDEST\";\n\n  while (hasMoreRecordings) {\n    requestCount++;\n    const elapsedTime = Date.now() - startTime;\n    const expectedMinTime = (requestCount - 1) * 50;\n\n    if (elapsedTime < expectedMinTime) {\n      const delayTime = expectedMinTime - elapsedTime;\n      console.log(`Rate limiting: waiting ${delayTime}ms before next request...`);\n      await new Promise((resolve) => setTimeout(resolve, delayTime));\n    }\n\n    const url = new URL(baseUrl);\n    url.searchParams.append(\"limit\", limit.toString());\n\n    if (endingBefore) {\n      url.searchParams.append(\"ending_before\", endingBefore);\n    }\n\n    let retries = 0;\n    const maxRetries = 5;\n    let response: Response | undefined;\n\n    while (retries <= maxRetries) {\n      try {\n        console.log(\"url\", url.toString());\n        response = await fetch(url.toString(), {\n          headers: {\n            Authorization: `Bearer ${apiKey}`,\n            \"Content-Type\": \"application/json\",\n          },\n        });\n\n        if (response.ok) {\n          break;\n        }\n\n        if (response.status === 404) {\n          console.log(\"No recordings found or endpoint not available\");\n          return [];\n        }\n\n        if (response.status === 429) {\n          if (retries < maxRetries) {\n            const backoffDelay = Math.pow(2, retries) * 1000;\n            console.log(\n              `Rate limit exceeded (429). Retrying in ${backoffDelay / 1000}s... (attempt ${retries + 1}/${\n                maxRetries + 1\n              })`\n            );\n            await new Promise((resolve) => setTimeout(resolve, backoffDelay));\n            retries++;\n            continue;\n          } else {\n            throw new Error(`Rate limit exceeded after ${maxRetries + 1} attempts`);\n          }\n        }\n\n        throw new Error(`HTTP error! status: ${response.status}`);\n      } catch (error) {\n        if (retries < maxRetries && (error as Error).message.includes(\"fetch\")) {\n          const backoffDelay = Math.pow(2, retries) * 1000;\n          console.log(\n            `Network error. Retrying in ${backoffDelay / 1000}s... (attempt ${retries + 1}/${maxRetries + 1})`\n          );\n          await new Promise((resolve) => setTimeout(resolve, backoffDelay));\n          retries++;\n          continue;\n        }\n        throw error;\n      }\n    }\n\n    if (!response?.ok) {\n      throw new Error(`Failed to fetch recordings after ${maxRetries + 1} attempts`);\n    }\n\n    const data = (await response.json()) as RecordingsResponse;\n\n    if (!data.data || data.data.length === 0) {\n      console.log(\"No more recordings available, ending pagination\");\n      hasMoreRecordings = false;\n      break;\n    }\n\n    const filteredRecordings = data.data.filter((recording) => {\n      return recording.start_ts < cutoffTimestamp;\n    });\n\n    allRecordings.push(...filteredRecordings);\n    console.log(\n      `Fetched ${data.data.length} recordings, ${filteredRecordings.length} older than 6 months (total: ${allRecordings.length})`\n    );\n\n    endingBefore = data.data[0].id;\n    console.log(\"endingBefore\", endingBefore);\n    console.log(\"first recording in batch\", data.data[0]);\n    console.log(\"last recording in batch\", data.data[data.data.length - 1]);\n\n    if (data.data.length < limit) {\n      console.log(\"Received fewer results than limit, reached end of data\");\n      hasMoreRecordings = false;\n      break;\n    }\n\n    if (filteredRecordings.length === 0 && data.data.every((r) => r.start_ts >= cutoffTimestamp)) {\n      console.log(\"Reached recordings newer than 6 months, stopping\");\n      hasMoreRecordings = false;\n      break;\n    }\n  }\n\n  return allRecordings;\n}",
    "endLine": 170,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-getallrecordingsolderthan6months-1f76292bbf",
    "sourcePath": "packages/app-store/dailyvideo/lib/scripts/deleteRecordings.ts",
    "startLine": 27,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/app-store/dailyvideo/lib/scripts/deleteRecordings.ts#L27-L170",
    "verifiedSourceHash": "sha256:0e348a38b22aabe721b614d085f09495540f7b7c62ef6c86f0b688bf8e4351f3"
  },
  {
    "anchorId": "source-repository-health-complexity-makesqlcondition-dd6bea900f",
    "code": " * Builds a SQL where clause for use with raw SQL queries\n */\nexport function makeSqlCondition(filterValue: FilterValue): Prisma.Sql | null {\n  if (isMultiSelectFilterValue(filterValue)) {\n    return Prisma.sql`= ANY(${filterValue.data})`;\n  } else if (isSingleSelectFilterValue(filterValue)) {\n    return Prisma.sql`= ${filterValue.data}`;\n  } else if (isTextFilterValue(filterValue)) {\n    const { operator, operand } = filterValue.data;\n    switch (operator) {\n      case \"equals\":\n        return Prisma.sql`= ${operand}`;\n      case \"notEquals\":\n        return Prisma.sql`!= ${operand}`;\n      case \"contains\":\n        return Prisma.sql`ILIKE ${`%${operand}%`}`;\n      case \"notContains\":\n        return Prisma.sql`NOT ILIKE ${`%${operand}%`}`;\n      case \"startsWith\":\n        return Prisma.sql`ILIKE ${`${operand}%`}`;\n      case \"endsWith\":\n        return Prisma.sql`ILIKE ${`%${operand}`}`;\n      case \"isEmpty\":\n        return Prisma.sql`= ''`;\n      case \"isNotEmpty\":\n        return Prisma.sql`!= ''`;\n      default:\n        return null;\n    }\n  } else if (isNumberFilterValue(filterValue)) {\n    const { operator, operand } = filterValue.data;\n    switch (operator) {\n      case \"eq\":\n        return Prisma.sql`= ${operand}`;\n      case \"neq\":\n        return Prisma.sql`!= ${operand}`;\n      case \"gt\":\n        return Prisma.sql`> ${operand}`;\n      case \"gte\":\n        return Prisma.sql`>= ${operand}`;\n      case \"lt\":\n        return Prisma.sql`< ${operand}`;\n      case \"lte\":\n        return Prisma.sql`<= ${operand}`;\n      default:\n        return null;\n    }\n  }\n\n  return null;\n}",
    "endLine": 231,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-makesqlcondition-dd6bea900f",
    "sourcePath": "packages/features/data-table/lib/server.ts",
    "startLine": 181,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/data-table/lib/server.ts#L181-L231",
    "verifiedSourceHash": "sha256:65ded7444542ca65a12cd479854699ddef935f8c796b4c2e74665ece0b9ee415"
  },
  {
    "anchorId": "source-repository-health-complexity-posthandler-a46c710db0",
    "code": "};\n\nexport async function postHandler(request: NextRequest) {\n  const body = await request.json();\n\n  if (testRequestSchema.safeParse(body).success) {\n    return NextResponse.json({ message: \"Test request successful\" });\n  }\n\n  const headersList = await headers();\n  const testMode = process.env.NEXT_PUBLIC_IS_E2E || process.env.INTEGRATION_TEST_MODE;\n\n  if (!testMode) {\n    const hmacSecret = process.env.DAILY_WEBHOOK_SECRET;\n    if (!hmacSecret) {\n      return NextResponse.json({ message: \"No Daily Webhook Secret\" }, { status: 405 });\n    }\n\n    const webhookTimestamp = headersList.get(\"x-webhook-timestamp\");\n    const computed_signature = computeSignature(hmacSecret, body, webhookTimestamp);\n\n    if (headersList.get(\"x-webhook-signature\") !== computed_signature) {\n      return NextResponse.json({ message: \"Signature does not match\" }, { status: 403 });\n    }\n  }\n\n  log.info(\n    \"Daily video webhook Request Body:\",\n    safeStringify({\n      body,\n    })\n  );\n\n  try {\n    if (body?.type === \"recording.ready-to-download\") {\n      const recordingReadyResponse = recordingReadySchema.safeParse(body);\n\n      if (!recordingReadyResponse.success) {\n        return NextResponse.json({ message: \"Invalid Payload\" }, { status: 400 });\n      }\n\n      const { room_name, recording_id, status } = recordingReadyResponse.data.payload;\n\n      if (status !== \"finished\") {\n        return NextResponse.json({ message: \"Recording not finished\" }, { status: 400 });\n      }\n\n      const bookingReference = await getBookingReference(room_name);\n      const booking = await getBooking(bookingReference.bookingId as number);\n\n      const bookingRepository = new BookingRepository(prisma);\n\n      const [evt, updateRecordStatus, downloadLink, teamId] = await Promise.all([\n        getCalendarEvent(booking),\n        bookingRepository.updateRecordedStatus({\n          bookingUid: booking.uid,\n          isRecorded: true,\n        }),\n        getProxyDownloadLinkOfCalVideo(recording_id),\n        getTeamIdFromEventType({\n          eventType: {\n            team: { id: booking?.eventType?.teamId ?? null },\n            parentId: booking?.eventType?.parentId ?? null,\n          },\n        }),\n      ]);\n\n      const tasks = [\n        {\n          fn: triggerRecordingReadyWebhook({\n            evt,\n            downloadLink,\n            booking: {\n              userId: booking?.user?.id,\n              eventTypeId: booking.eventTypeId,\n              eventTypeParentId: booking.eventType?.parentId,\n              teamId,\n            },\n          }),\n          errorMsg: \"trigger recording ready webhook\",\n        },\n        {\n          fn: submitBatchProcessorTranscriptionJob(recording_id),\n          errorMsg: \"submit transcription batch processor job\",\n        },\n        {\n          fn: sendDailyVideoRecordingEmails(evt, downloadLink),\n          errorMsg: \"send recording emails\",\n        },\n      ];\n\n      const results = await Promise.allSettled(tasks.map((t) => t.fn));\n\n      results.forEach((result, index) => {\n        if (result.status === \"rejected\") {\n          log.error(`Failed to ${tasks[index].errorMsg}:`, safeStringify(result.reason));\n        }\n      });\n\n      return NextResponse.json({ message: \"Success\" });\n    } else if (body.type === \"meeting.ended\") {\n      const meetingEndedResponse = meetingEndedSchema.safeParse(body);\n      if (!meetingEndedResponse.success) {\n        return NextResponse.json({ message: \"Invalid Payload\" }, { status: 400 });\n      }\n\n      const { room, meeting_id } = meetingEndedResponse.data.payload;\n\n      const bookingReference = await getBookingReference(room);\n      const booking = await getBooking(bookingReference.bookingId as number);\n\n      if (!booking.eventType?.canSendCalVideoTranscriptionEmails) {\n        return NextResponse.json({\n          message: `Transcription emails are disabled for this event type ${booking.eventTypeId}`,\n        });\n      }\n\n      const transcripts = await getAllTranscriptsAccessLinkFromMeetingId(meeting_id);\n\n      if (!transcripts || !transcripts.length)\n        return NextResponse.json({\n          message: `No Transcripts found for room name ${room} and meeting id ${meeting_id}`,\n        });\n\n      const evt = await getCalendarEvent(booking);\n      await sendDailyVideoTranscriptEmails(evt, transcripts);\n\n      return NextResponse.json({ message: \"Success\" });\n    } else if (body?.type === \"batch-processor.job-finished\") {\n      const batchProcessorJobFinishedResponse = batchProcessorJobFinishedSchema.safeParse(body);\n\n      if (!batchProcessorJobFinishedResponse.success) {\n        return NextResponse.json({ message: \"Invalid Payload\" }, { status: 400 });\n      }\n\n      const { id, input } = batchProcessorJobFinishedResponse.data.payload;\n      const roomName = await getRoomNameFromRecordingId(input.recordingId);\n\n      const bookingReference = await getBookingReference(roomName);\n\n      const booking = await getBooking(bookingReference.bookingId as number);\n\n      const teamId = await getTeamIdFromEventType({\n        eventType: {\n          team: { id: booking?.eventType?.teamId ?? null },\n          parentId: booking?.eventType?.parentId ?? null,\n        },\n      });\n\n      const [evt, recording, batchProcessorJobAccessLink] = await Promise.all([\n        getCalendarEvent(booking),\n        getProxyDownloadLinkOfCalVideo(input.recordingId),\n        getBatchProcessorJobAccessLink(id),\n      ]);\n\n      await triggerTranscriptionGeneratedWebhook({\n        evt,\n        downloadLinks: {\n          transcription: batchProcessorJobAccessLink.transcription,\n          recording,\n        },\n        booking: {\n          userId: booking?.user?.id,\n          eventTypeId: booking.eventTypeId,\n          eventTypeParentId: booking.eventType?.parentId,\n          teamId,\n        },\n      });\n\n      return NextResponse.json({ message: \"Success\" });\n    } else {\n      log.error(\"Invalid type in /recorded-daily-video\", body);\n      return NextResponse.json({\n        message: \"Invalid type in /recorded-daily-video\",\n      });\n    }\n  } catch (err) {\n    log.error(\"Error in /recorded-daily-video\", err);\n\n    if (err instanceof HttpError) {\n      return NextResponse.json({ message: err.message }, { status: err.statusCode });\n    } else {\n      return NextResponse.json({ message: \"something went wrong\" }, { status: 500 });\n    }\n  }\n}",
    "endLine": 237,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-posthandler-a46c710db0",
    "sourcePath": "apps/web/app/api/recorded-daily-video/route.ts",
    "startLine": 52,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/app/api/recorded-daily-video/route.ts#L52-L237",
    "verifiedSourceHash": "sha256:b5050d0d6fec35b52d06d19e23cac3dbb6caebbf93e7b3fc6f848a2349882eeb"
  },
  {
    "anchorId": "source-repository-health-complexity-listbookings-cc5211fc34",
    "code": "}\n\nexport async function listBookings(\n  appApiKey?: ApiKey,\n  account?: {\n    id: number;\n    name: string | null;\n    isTeam: boolean;\n  } | null\n) {\n  const userId = appApiKey ? appApiKey.userId : account && !account.isTeam ? account.id : null;\n  const teamId = appApiKey ? appApiKey.teamId : account && account.isTeam ? account.id : null;\n  try {\n    const where: Prisma.BookingWhereInput = {};\n    if (teamId) {\n      where.eventType = {\n        OR: [{ teamId }, { parent: { teamId } }],\n      };\n    } else {\n      where.eventType = { userId };\n    }\n\n    const bookings = await prisma.booking.findMany({\n      take: 3,\n      where: where,\n      orderBy: {\n        id: \"desc\",\n      },\n      select: {\n        uid: true,\n        title: true,\n        description: true,\n        customInputs: true,\n        responses: true,\n        startTime: true,\n        endTime: true,\n        location: true,\n        cancellationReason: true,\n        status: true,\n        metadata: true,\n        user: {\n          select: {\n            username: true,\n            name: true,\n            email: true,\n            timeZone: true,\n            locale: true,\n          },\n        },\n        eventType: {\n          select: {\n            title: true,\n            description: true,\n            requiresConfirmation: true,\n            price: true,\n            currency: true,\n            length: true,\n            bookingFields: true,\n            team: true,\n          },\n        },\n        attendees: {\n          select: {\n            name: true,\n            email: true,\n            timeZone: true,\n          },\n        },\n      },\n    });\n    if (bookings.length === 0) {\n      return [];\n    }\n    const t = await getTranslation(bookings[0].user?.locale ?? \"en\", \"common\");\n\n    const updatedBookings = bookings.map((booking) => {\n      const parsedMetadata = bookingMetadataSchema.safeParse(booking.metadata || {});\n      return {\n        ...booking,\n        ...getCalEventResponses({\n          bookingFields: booking.eventType?.bookingFields ?? null,\n          booking,\n        }),\n        location: getHumanReadableLocationValue(booking.location || \"\", t),\n        metadata: {\n          videoCallUrl: parsedMetadata.success ? parsedMetadata.data?.videoCallUrl : undefined,\n        },\n      };\n    });\n\n    return updatedBookings;\n  } catch (err) {\n    const userId = appApiKey ? appApiKey.userId : account && !account.isTeam ? account.id : null;\n    const teamId = appApiKey ? appApiKey.teamId : account && account.isTeam ? account.id : null;\n\n    log.error(\n      `Error retrieving list of bookings for ${teamId ? `team ${teamId}` : `user ${userId}`}.`,\n      safeStringify(err)\n    );\n  }\n}",
    "endLine": 280,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-listbookings-cc5211fc34",
    "sourcePath": "packages/features/webhooks/lib/scheduleTrigger.ts",
    "startLine": 180,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/webhooks/lib/scheduleTrigger.ts#L180-L280",
    "verifiedSourceHash": "sha256:b6b5e6f560369fe015746121df09c9108e632faad288965ae5c087d0125f148b"
  },
  {
    "anchorId": "source-repository-health-complexity-handler-8a6b2cd78f",
    "code": "const SUPPORTED_INVOICE_EVENTS = [\"InvoiceSettled\", \"InvoiceProcessing\"];\n\nexport default async function handler(req: NextApiRequest, res: NextApiResponse) {\n  try {\n    if (req.method !== \"POST\") throw new HttpCode({ statusCode: 405, message: \"Method Not Allowed\" });\n    const rawBody = await getRawBody(req);\n    const bodyAsString = rawBody.toString();\n\n    const signature = req.headers[\"btcpay-sig\"] || req.headers[\"BTCPay-Sig\"];\n    if (!signature || typeof signature !== \"string\" || !signature.startsWith(\"sha256=\"))\n      throw new HttpCode({ statusCode: 401, message: \"Missing or invalid signature format\" });\n\n    const webhookData = btcpayWebhookSchema.safeParse(JSON.parse(bodyAsString));\n    if (!webhookData.success) return res.status(400).json({ message: \"Invalid webhook payload\" });\n\n    const data = webhookData.data;\n    if (!SUPPORTED_INVOICE_EVENTS.includes(data.type))\n      return res.status(200).send({ message: \"Webhook received but ignored\" });\n\n    const bookingPaymentRepository = new BookingPaymentRepository();\n    const payment = await bookingPaymentRepository.findByExternalIdIncludeBookingUserCredentials(\n      data.invoiceId,\n      appConfig.type\n    );\n    if (!payment) throw new HttpCode({ statusCode: 404, message: \"Cal.diy: payment not found\" });\n    if (payment.success) return res.status(200).send({ message: \"Payment already registered\" });\n    const key = payment.booking?.user?.credentials?.[0].key;\n    if (!key) throw new HttpCode({ statusCode: 404, message: \"Cal.diy: credentials not found\" });\n\n    const parsedKey = btcpayCredentialKeysSchema.safeParse(key);\n    if (!parsedKey.success)\n      throw new HttpCode({ statusCode: 400, message: \"Cal.diy: Invalid BTCPay credentials\" });\n\n    const { webhookSecret, storeId } = parsedKey.data;\n    if (storeId !== data.storeId)\n      throw new HttpCode({ statusCode: 400, message: \"Cal.diy: Store ID mismatch\" });\n\n    const expectedSignature = signature.split(\"=\")[1];\n    const computedSignature = verifyBTCPaySignature(rawBody, expectedSignature, webhookSecret);\n\n    if (computedSignature.length !== expectedSignature.length) {\n      throw new HttpCode({ statusCode: 400, message: \"signature mismatch\" });\n    }\n    const isValid = crypto.timingSafeEqual(\n      Buffer.from(computedSignature, \"hex\"),\n      Buffer.from(expectedSignature, \"hex\")\n    );\n    if (!isValid) throw new HttpCode({ statusCode: 400, message: \"signature mismatch\" });\n\n    const traceContext = distributedTracing.createTrace(\"btcpayserver_webhook\", {\n      meta: { paymentId: payment.id, bookingId: payment.bookingId },\n    });\n    await handlePaymentSuccess({\n      paymentId: payment.id,\n      bookingId: payment.bookingId,\n      appSlug: appConfig.slug,\n      traceContext,\n    });\n    return res.status(200).json({ success: true });\n  } catch (_err) {\n    const err = getServerErrorFromUnknown(_err);\n    return res.status(err.statusCode).send({\n      message: err.message,\n      stack: IS_PRODUCTION ? undefined : err.cause?.stack,\n    });\n  }\n}\r",
    "endLine": 108,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-handler-8a6b2cd78f",
    "sourcePath": "packages/app-store/btcpayserver/api/webhook.ts",
    "startLine": 42,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/app-store/btcpayserver/api/webhook.ts#L42-L108",
    "verifiedSourceHash": "sha256:6152d690869bd13f353718a42a0ed613533d5cf20e835f357f916c5d8fe24650"
  },
  {
    "anchorId": "source-repository-health-complexity-gethandler-0a4d35f32d",
    "code": "import { getGoogleAppKeys } from \"../lib/getGoogleAppKeys\";\n\nasync function getHandler(req: NextApiRequest, res: NextApiResponse) {\n  const { code } = req.query;\n  const state = decodeOAuthState(req);\n\n  if (typeof code !== \"string\") {\n    if (state?.onErrorReturnTo || state?.returnTo) {\n      res.redirect(\n        getSafeRedirectUrl(state.onErrorReturnTo) ??\n          getSafeRedirectUrl(state?.returnTo) ??\n          `${WEBAPP_URL}/apps/installed`\n      );\n      return;\n    }\n    throw new HttpError({ statusCode: 400, message: \"`code` must be a string\" });\n  }\n\n  if (!req.session?.user?.id) {\n    throw new HttpError({ statusCode: 401, message: \"You must be logged in to do this\" });\n  }\n\n  const { client_id, client_secret } = await getGoogleAppKeys();\n\n  const redirect_uri = `${WEBAPP_URL_FOR_OAUTH}/api/integrations/googlecalendar/callback`;\n\n  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uri);\n\n  if (code) {\n    const token = await oAuth2Client.getToken(code);\n    const key = token.tokens;\n    const grantedScopes = token.tokens.scope?.split(\" \") ?? [];\n    // Check if we have granted all required permissions\n    const hasMissingRequiredScopes = GOOGLE_CALENDAR_SCOPES.some((scope) => !grantedScopes.includes(scope));\n    if (hasMissingRequiredScopes) {\n      if (!state?.fromApp) {\n        throw new HttpError({\n          statusCode: 400,\n          message: \"You must grant all permissions to use this integration\",\n        });\n      }\n      res.redirect(\n        getSafeRedirectUrl(state.onErrorReturnTo) ??\n          getSafeRedirectUrl(state?.returnTo) ??\n          `${WEBAPP_URL}/apps/installed`\n      );\n      return;\n    }\n\n    oAuth2Client.setCredentials(key);\n\n    const gcalCredentialData = buildCredentialCreateData({\n      userId: req.session.user.id,\n      key,\n      appId: \"google-calendar\",\n      type: \"google_calendar\",\n    });\n    const gcalCredential = await CredentialRepository.create(gcalCredentialData);\n\n    const gCalService = createGoogleCalendarServiceWithGoogleType({\n      ...gcalCredential,\n      user: null,\n      delegatedTo: null,\n    });\n\n    const calendar = new calendar_v3.Calendar({\n      auth: oAuth2Client,\n    });\n\n    const primaryCal = await gCalService.getPrimaryCalendar(calendar);\n\n    // If we still don't have a primary calendar skip creating the selected calendar.\n    // It can be toggled on later.\n    if (!primaryCal?.id) {\n      res.redirect(\n        getSafeRedirectUrl(state?.returnTo) ??\n          getInstalledAppPath({ variant: \"calendar\", slug: \"google-calendar\" })\n      );\n      return;\n    }\n\n    // Only attempt to update the user's profile photo if the user has granted the required scope\n    if (grantedScopes.includes(SCOPE_USERINFO_PROFILE)) {\n      await updateProfilePhotoGoogle(oAuth2Client, req.session.user.id);\n    }\n\n    const selectedCalendarWhereUnique = {\n      userId: req.session.user.id,\n      externalId: primaryCal.id,\n      integration: \"google_calendar\",\n    };\n\n    // Wrapping in a try/catch to reduce chance of race conditions-\n    // also this improves performance for most of the happy-paths.\n    try {\n      await gCalService.upsertSelectedCalendar({\n        // First install should add a user-level selectedCalendar only.\n        eventTypeId: null,\n        externalId: selectedCalendarWhereUnique.externalId,\n      });\n    } catch (error) {\n      let errorMessage = \"something_went_wrong\";\n      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === \"P2002\") {\n        // it is possible a selectedCalendar was orphaned, in this situation-\n        // we want to recover by connecting the existing selectedCalendar to the new Credential.\n        if (await renewSelectedCalendarCredentialId(selectedCalendarWhereUnique, gcalCredential.id)) {\n          res.redirect(\n            getSafeRedirectUrl(state?.returnTo) ??\n              getInstalledAppPath({ variant: \"calendar\", slug: \"google-calendar\" })\n          );\n          return;\n        }\n        // else\n        errorMessage = \"account_already_linked\";\n      }\n      await CredentialRepository.deleteById({ id: gcalCredential.id });\n      res.redirect(\n        `${\n          getSafeRedirectUrl(state?.onErrorReturnTo) ??\n          getInstalledAppPath({ variant: \"calendar\", slug: \"google-calendar\" })\n        }?error=${errorMessage}`\n      );\n      return;\n    }\n  }\n\n  // No need to install? Redirect to the returnTo URL\n  if (!state?.installGoogleVideo) {\n    res.redirect(\n      getSafeRedirectUrl(state?.returnTo) ??\n        getInstalledAppPath({ variant: \"calendar\", slug: \"google-calendar\" })\n    );\n    return;\n  }\n\n  const existingGoogleMeetCredential = await CredentialRepository.findFirstByUserIdAndType({\n    userId: req.session.user.id,\n    type: \"google_video\",\n  });\n\n  // If the user already has a google meet credential, there's nothing to do in here\n  if (existingGoogleMeetCredential) {\n    res.redirect(\n      getSafeRedirectUrl(`${WEBAPP_URL}/apps/installed/conferencing?hl=google-meet`) ??\n        getInstalledAppPath({ variant: \"conferencing\", slug: \"google-meet\" })\n    );\n    return;\n  }\n\n  // Create a new google meet credential\n  const googleMeetCredentialData = buildCredentialCreateData({\n    userId: req.session.user.id,\n    type: \"google_video\",\n    key: {},\n    appId: \"google-meet\",\n  });\n  await CredentialRepository.create(googleMeetCredentialData);\n  res.redirect(\n    getSafeRedirectUrl(`${WEBAPP_URL}/apps/installed/conferencing?hl=google-meet`) ??\n      getInstalledAppPath({ variant: \"conferencing\", slug: \"google-meet\" })\n  );\n}",
    "endLine": 185,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-gethandler-0a4d35f32d",
    "sourcePath": "packages/app-store/googlecalendar/api/callback.ts",
    "startLine": 24,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/app-store/googlecalendar/api/callback.ts#L24-L185",
    "verifiedSourceHash": "sha256:be878c111fc8ac02a6a69798646fedea37c5dad9ce1a53cafdde4a16ad12001f"
  },
  {
    "anchorId": "source-repository-health-complexity-updateallcalendarevents-ff090ad106",
    "code": "   * @private\n   */\n  private async updateAllCalendarEvents(\n    event: CalendarEvent,\n    booking: PartialBooking,\n    newBookingId?: number\n  ): Promise<Array<EventResult<NewCalendarEventType>>> {\n    let calendarReference: PartialReference[] | undefined = undefined,\n      credential;\n    log.silly(\"updateAllCalendarEvents\", JSON.stringify({ event, booking, newBookingId }));\n    try {\n      // If a newBookingId is given, update that calendar event\n      let newBooking;\n      if (newBookingId) {\n        newBooking = await prisma.booking.findUnique({\n          where: {\n            id: newBookingId,\n          },\n          select: {\n            references: true,\n          },\n        });\n      }\n\n      calendarReference = newBooking?.references.length\n        ? newBooking.references.filter((reference) => reference.type.includes(\"_calendar\"))\n        : booking.references.filter((reference) => reference.type.includes(\"_calendar\"));\n\n      if (calendarReference.length === 0) {\n        return [];\n      }\n      // process all calendar references\n      let result = [];\n      for (const reference of calendarReference) {\n        const { uid: bookingRefUid, externalCalendarId: bookingExternalCalendarId } = reference;\n        let calendarExternalId: string | null = null;\n        if (bookingExternalCalendarId) {\n          calendarExternalId = bookingExternalCalendarId;\n        }\n\n        if (reference.credentialId) {\n          credential = this.calendarCredentials.filter(\n            (credential) => credential.id === reference?.credentialId\n          )[0];\n          if (!credential) {\n            // Fetch credential from DB\n            const credentialFromDB = await CredentialRepository.findCredentialForCalendarServiceById({\n              id: reference.credentialId,\n            });\n            if (credentialFromDB && credentialFromDB.appId) {\n              credential = {\n                id: credentialFromDB.id,\n                type: credentialFromDB.type,\n                key: credentialFromDB.key,\n                userId: credentialFromDB.userId,\n                teamId: credentialFromDB.teamId,\n                invalid: credentialFromDB.invalid,\n                appId: credentialFromDB.appId,\n                user: credentialFromDB.user,\n                encryptedKey: credentialFromDB.encryptedKey,\n                delegatedToId: credentialFromDB.delegatedToId,\n                delegatedTo: credentialFromDB.delegatedTo,\n                delegationCredentialId: credentialFromDB.delegationCredentialId,\n              };\n            }\n          }\n          result.push(updateEvent(credential, event, bookingRefUid, calendarExternalId));\n        } else {\n          const credentials = this.calendarCredentials.filter(\n            (credential) => credential.type === reference?.type\n          );\n          for (const credential of credentials) {\n            log.silly(\"updateAllCalendarEvents-credential\", JSON.stringify({ credentials }));\n            result.push(updateEvent(credential, event, bookingRefUid, calendarExternalId));\n          }\n        }\n      }\n      // If we are merging two calendar events we should delete the old calendar event\n      if (newBookingId) {\n        const oldCalendarEvent = booking.references.find((reference) => reference.type.includes(\"_calendar\"));\n\n        if (oldCalendarEvent?.credentialId) {\n          const calendarCredential = await CredentialRepository.findCredentialForCalendarServiceById({\n            id: oldCalendarEvent.credentialId,\n          });\n          const calendar = await getCalendar(calendarCredential, \"booking\");\n          await calendar?.deleteEvent(oldCalendarEvent.uid, event, oldCalendarEvent.externalCalendarId);\n        }\n      }\n\n      // Taking care of non-traditional calendar integrations\n      result = result.concat(\n        this.calendarCredentials\n          .filter((cred) => cred.type.includes(\"other_calendar\"))\n          .map(async (cred) => {\n            const calendarReference = booking.references.find((ref) => ref.type === cred.type);\n\n            if (!calendarReference) {\n              return {\n                appName: cred.appName || cred.appId || \"\",\n                type: cred.type,\n                success: false,\n                uid: \"\",\n                originalEvent: event,\n                credentialId: cred.id,\n              };\n            }\n            const { externalCalendarId: bookingExternalCalendarId, meetingId: bookingRefUid } =\n              calendarReference;\n            return await updateEvent(cred, event, bookingRefUid ?? null, bookingExternalCalendarId ?? null);\n          })\n      );\n\n      return Promise.all(result);\n    } catch (error) {\n      let message = `Tried to 'updateAllCalendarEvents' but there was no '{thing}' for '${credential?.type}', userId: '${credential?.userId}', bookingId: '${booking?.id}'`;\n      if (error instanceof Error) {\n        message = message.replace(\"{thing}\", error.message);\n      }\n\n      return Promise.resolve(\n        calendarReference?.map((reference) => {\n          return {\n            appName: \"none\",\n            type: reference?.type || \"calendar\",\n            success: false,\n            uid: \"\",\n            originalEvent: event,\n            credentialId: 0,\n          };\n        }) ?? ([] as Array<EventResult<NewCalendarEventType>>)\n      );\n    }\n  }",
    "endLine": 1231,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-updateallcalendarevents-ff090ad106",
    "sourcePath": "packages/features/bookings/lib/EventManager.ts",
    "startLine": 1098,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/bookings/lib/EventManager.ts#L1098-L1231",
    "verifiedSourceHash": "sha256:d6e9878cbe0ab5ae8161be16dc0b99c80586e07956d29621b66ae74363a71d67"
  },
  {
    "anchorId": "source-repository-health-complexity-handler-5e21cda35d",
    "code": "import stripe from \"../lib/server\";\n\nexport default async function handler(req: NextApiRequest, res: NextApiResponse) {\n  if (req.method === \"GET\") {\n    const session = await getServerSession({ req });\n    const userId = session?.user?.id;\n    let { intentUsername = null } = req.query;\n    const { callbackUrl } = req.query;\n    if (!userId || !intentUsername) {\n      res.status(404).json({ message: \"Missing required parameters: userId or intentUsername\" });\n      return;\n    }\n    if (intentUsername && typeof intentUsername === \"object\") {\n      intentUsername = intentUsername[0];\n    }\n    const customerId = await getStripeCustomerIdFromUserId(userId);\n    if (!customerId) {\n      res.status(404).json({ message: \"Missing customer id\" });\n      return;\n    }\n\n    const userData = await prisma.user.findFirst({\n      where: { id: userId },\n      select: { id: true, metadata: true },\n    });\n    if (!userData) {\n      res.status(404).json({ message: \"Missing user data\" });\n      return;\n    }\n\n    const return_url = `${WEBAPP_URL}/api/integrations/stripepayment/paymentCallback?checkoutSessionId={CHECKOUT_SESSION_ID}&callbackUrl=${callbackUrl}`;\n    const createSessionParams: Stripe.Checkout.SessionCreateParams = {\n      mode: \"subscription\",\n      line_items: [\n        {\n          quantity: 1,\n          price: getPremiumMonthlyPlanPriceId(),\n        },\n      ],\n      allow_promotion_codes: true,\n      customer: customerId,\n      success_url: return_url,\n      cancel_url: return_url,\n      metadata: {\n        userId: userId.toString(),\n        intentUsername,\n      },\n    };\n\n    const checkPremiumResult = await usernameCheck(intentUsername);\n    if (!checkPremiumResult.available) {\n      return res.status(404).json({ message: \"Intent username not available\" });\n    }\n    const stripeCustomer = await stripe.customers.retrieve(customerId);\n    if (!stripeCustomer || stripeCustomer.deleted) {\n      return res.status(400).json({ message: \"Stripe customer not found or deleted\" });\n    }\n    await stripe.customers.update(customerId, {\n      metadata: {\n        ...stripeCustomer.metadata,\n        username: intentUsername,\n      },\n    });\n\n    if (userData) {\n      await prisma.user.update({\n        where: { id: userId },\n        data: {\n          metadata: {\n            ...((userData.metadata as Prisma.JsonObject) || {}),\n            isPremium: false,\n          },\n        },\n      });\n    }\n    const checkoutSession = await stripe.checkout.sessions.create(createSessionParams);\n    if (checkoutSession?.url) {\n      return res.redirect(checkoutSession.url).end();\n    }\n    return res.status(404).json({ message: \"Couldn't redirect to stripe checkout session\" });\n  }\n}",
    "endLine": 91,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-handler-5e21cda35d",
    "sourcePath": "packages/app-store/stripepayment/api/subscription.ts",
    "startLine": 10,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/app-store/stripepayment/api/subscription.ts#L10-L91",
    "verifiedSourceHash": "sha256:26fcc50ea29036ffc00d37bea2cfafb677977cb2b3a14e729f04f372d741c40d"
  },
  {
    "anchorId": "source-repository-health-complexity-transformlocationsinternaltoapi-51d63af3ff",
    "code": "};\n\nexport function transformLocationsInternalToApi(internalLocations: InternalLocation[] | undefined) {\n  if (!internalLocations) {\n    return [];\n  }\n\n  const apiLocations: OutputLocation_2024_06_14[] = [];\n\n  for (const location of internalLocations) {\n    switch (location.type) {\n      case \"inPerson\": {\n        if (!location.address) {\n          continue;\n        }\n        const addressLocation: OutputAddressLocation_2024_06_14 = {\n          type: \"address\",\n          address: location.address,\n          public: location.displayLocationPublicly,\n        };\n        apiLocations.push(addressLocation);\n        break;\n      }\n      case \"attendeeInPerson\": {\n        const attendeeAddressLocation: OutputAttendeeAddressLocation_2024_06_14 = {\n          type: \"attendeeAddress\",\n        };\n        apiLocations.push(attendeeAddressLocation);\n        break;\n      }\n      case \"link\": {\n        if (!location.link) {\n          continue;\n        }\n        const linkLocation: OutputLinkLocation_2024_06_14 = {\n          type: \"link\",\n          link: location.link,\n          public: location.displayLocationPublicly,\n        };\n        apiLocations.push(linkLocation);\n        break;\n      }\n      case \"userPhone\": {\n        if (!location.hostPhoneNumber) {\n          continue;\n        }\n        const phoneLocation: OutputPhoneLocation_2024_06_14 = {\n          type: \"phone\",\n          phone: location.hostPhoneNumber,\n          public: location.displayLocationPublicly,\n        };\n        apiLocations.push(phoneLocation);\n        break;\n      }\n      case \"phone\": {\n        const attendeePhoneLocation: OutputAttendeePhoneLocation_2024_06_14 = {\n          type: \"attendeePhone\",\n        };\n        apiLocations.push(attendeePhoneLocation);\n        break;\n      }\n      case \"somewhereElse\": {\n        const attendeeDefinedLocation: OutputAttendeeDefinedLocation_2024_06_14 = {\n          type: \"attendeeDefined\",\n        };\n        apiLocations.push(attendeeDefinedLocation);\n        break;\n      }\n      case \"conferencing\": {\n        const conferencingLocation: OutputOrganizersDefaultAppLocation_2024_06_14 = {\n          type: \"organizersDefaultApp\",\n        };\n        apiLocations.push(conferencingLocation);\n        break;\n      }\n      default: {\n        const integrationType = internalToApiIntegrationsMapping[location.type];\n        if (!integrationType) {\n          const unknown: OutputUnknownLocation_2024_06_14 = {\n            type: \"unknown\",\n            location: JSON.stringify(location),\n          };\n          apiLocations.push(unknown);\n          break;\n        }\n        const integration: OutputIntegrationLocation_2024_06_14 = {\n          type: \"integration\",\n          integration: integrationType,\n          link: location.link,\n          credentialId: location.credentialId,\n        };\n        apiLocations.push(integration);\n        break;\n      }\n    }\n  }\n\n  return apiLocations;\n}",
    "endLine": 145,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-transformlocationsinternaltoapi-51d63af3ff",
    "sourcePath": "apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/internal-to-api/locations.ts",
    "startLine": 47,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/internal-to-api/locations.ts#L47-L145",
    "verifiedSourceHash": "sha256:4f367ad68ef13f036218463fe12708197f510b1c421bb46fc4c7275f9462c28e"
  },
  {
    "anchorId": "source-repository-health-complexity-transformlocation-4f350d0d5a",
    "code": "  }\n\n  transformLocation(\n    location: string | BookingInputLocation_2024_08_13 | UpdateBookingInputLocation_2024_08_13\n  ): {\n    value: string;\n    optionValue: string;\n  } {\n    if (typeof location === \"string\") {\n      // note(Lauris): this is for backwards compatibility because before switching to booking location objects\n      // we only received a string. If someone is complaining that their location is not displaying as a URL\n      // or whatever check that they are not providing a string for bookign location but one of the input objects.\n      if (isURL(location, { require_protocol: false }) || location.startsWith(\"www.\")) {\n        return {\n          value: \"link\",\n          optionValue: location,\n        };\n      }\n\n      if (isPhoneNumber(location)) {\n        return {\n          value: \"phone\",\n          optionValue: location,\n        };\n      }\n\n      return {\n        value: \"somewhereElse\",\n        optionValue: location,\n      };\n    }\n\n    if (location.type === \"integration\") {\n      const integration = apiToInternalintegrationsMapping[location.integration];\n      if (!integration) {\n        throw new BadRequestException(`Invalid integration: ${location.integration}`);\n      }\n      return {\n        value: integration,\n        optionValue: \"\",\n      };\n    }\n\n    if (location.type === \"address\") {\n      return {\n        value: \"inPerson\",\n        optionValue: \"\",\n      };\n    }\n\n    if (location.type === \"attendeeAddress\") {\n      return {\n        value: \"attendeeInPerson\",\n        optionValue: location.address,\n      };\n    }\n\n    if (location.type === \"link\") {\n      return {\n        value: \"link\",\n        optionValue: \"\",\n      };\n    }\n\n    if (location.type === \"phone\") {\n      return {\n        value: \"userPhone\",\n        optionValue: \"\",\n      };\n    }\n\n    if (location.type === \"organizersDefaultApp\") {\n      return {\n        value: \"conferencing\",\n        optionValue: \"\",\n      };\n    }\n\n    if (location.type === \"attendeePhone\") {\n      return {\n        value: \"phone\",\n        optionValue: location.phone,\n      };\n    }\n\n    if (location.type === \"attendeeDefined\") {\n      return {\n        value: \"somewhereElse\",\n        optionValue: location.location,\n      };\n    }\n\n    throw new BadRequestException(\n      `Booking location with type ${(location as BookingInputLocation_2024_08_13).type} not valid.`\n    );\n  }",
    "endLine": 375,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-transformlocation-4f350d0d5a",
    "sourcePath": "apps/api/v2/src/platform/bookings/2024-08-13/services/input.service.ts",
    "startLine": 280,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/api/v2/src/platform/bookings/2024-08-13/services/input.service.ts#L280-L375",
    "verifiedSourceHash": "sha256:f60c3190457fda7ea85fc578d95ebd56c8edb80af84118fe71f00c92c2d6ddce"
  },
  {
    "anchorId": "source-repository-health-complexity-getpubliceventtypeforatoms-151cb2589d",
    "code": "   * Returns the public event type for atoms, handling both team and user events.\n   */\n  async getPublicEventTypeForAtoms({\n    username,\n    eventSlug,\n    isTeamEvent,\n    orgId,\n    teamId,\n  }: {\n    username?: string;\n    eventSlug: string;\n    isTeamEvent?: boolean;\n    orgId?: number;\n    teamId?: number;\n  }): Promise<PublicEventType> {\n    const orgSlug = orgId ? await this.getTeamSlug(orgId) : null;\n\n    let usernameOrTeamSlug: string | null = null;\n    if (isTeamEvent) {\n      if (!teamId) {\n        throw new BadRequestException(\"teamId is required for team events, please provide a valid teamId\");\n      }\n      usernameOrTeamSlug = await this.getTeamSlug(teamId);\n    } else {\n      if (!username) {\n        throw new BadRequestException(\n          \"username is required for non-team events, please provide a valid username\"\n        );\n      }\n      usernameOrTeamSlug = username;\n    }\n\n    usernameOrTeamSlug = usernameOrTeamSlug.toLowerCase();\n\n    try {\n      let event = await getPublicEvent(\n        usernameOrTeamSlug,\n        eventSlug,\n        isTeamEvent,\n        orgSlug,\n        this.dbRead.prisma as unknown as PrismaClient,\n        true\n      );\n\n      const usernamePossiblyNotFromProfile = username && orgId && !event;\n      if (usernamePossiblyNotFromProfile) {\n        const user = await this.usersRepository.findByUsernameWithProfile(username);\n        if (user) {\n          const profile = await this.usersService.getUserMainProfile(user);\n          if (profile?.username) {\n            event = await getPublicEvent(\n              profile.username,\n              eventSlug,\n              isTeamEvent,\n              orgSlug,\n              this.dbRead.prisma as unknown as PrismaClient,\n              true\n            );\n          }\n        }\n      }\n\n      if (!event) {\n        throw new NotFoundException(`Event type with slug ${eventSlug} not found`);\n      }\n\n      return event;\n    } catch (err) {\n      if (err instanceof Error) {\n        throw new NotFoundException(err.message);\n      }\n      throw new NotFoundException(`Event type with slug ${eventSlug} not found`);\n    }\n  }",
    "endLine": 434,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-getpubliceventtypeforatoms-151cb2589d",
    "sourcePath": "apps/api/v2/src/modules/atoms/services/event-types-atom.service.ts",
    "startLine": 361,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/api/v2/src/modules/atoms/services/event-types-atom.service.ts#L361-L434",
    "verifiedSourceHash": "sha256:91d8d2c6b7ea82e9ff9e3078a2b95d569209970155a37cd8cfc61899df136c48"
  },
  {
    "anchorId": "source-repository-health-complexity-handler-ca648e6081",
    "code": "}\n\nexport async function handler(req: NextApiRequest, res: NextApiResponse) {\n  const { token } = verifySchema.parse(req.query);\n\n  const foundToken = await prisma.verificationToken.findFirst({\n    where: {\n      token,\n    },\n  });\n\n  if (!foundToken) {\n    return res.status(401).json({ message: \"No token found\" });\n  }\n\n  if (dayjs(foundToken?.expires).isBefore(dayjs())) {\n    return res.status(401).json({ message: \"Token expired\" });\n  }\n\n  // The user is verifying the secondary email\n  if (foundToken?.secondaryEmailId) {\n    await prisma.secondaryEmail.update({\n      where: {\n        id: foundToken.secondaryEmailId,\n        email: foundToken?.identifier,\n      },\n      data: {\n        emailVerified: new Date(),\n      },\n    });\n\n    await cleanUpVerificationTokens(foundToken.id);\n\n    return res.redirect(`${WEBAPP_URL}/settings/my-account/profile`);\n  }\n\n  const user = await prisma.user.findFirst({\n    where: {\n      email: foundToken?.identifier,\n    },\n  });\n\n  if (!user) {\n    return res.status(401).json({ message: \"Cannot find a user attached to this token\" });\n  }\n\n  const userMetadataParsed = userMetadata.parse(user.metadata);\n  // Attach the new email and verify\n  if (userMetadataParsed?.emailChangeWaitingForVerification) {\n    // Ensure this email isn't in use\n    const existingUser = await prisma.user.findUnique({\n      where: { email: userMetadataParsed?.emailChangeWaitingForVerification },\n      select: {\n        id: true,\n      },\n    });\n    if (existingUser) {\n      return res.status(401).json({ message: USER_ALREADY_EXISTING_MESSAGE });\n    }\n\n    // Ensure this email isn't being added by another user as secondary email\n    const existingSecondaryUser = await prisma.secondaryEmail.findUnique({\n      where: {\n        email: userMetadataParsed?.emailChangeWaitingForVerification,\n      },\n      select: {\n        id: true,\n        userId: true,\n      },\n    });\n\n    if (existingSecondaryUser && existingSecondaryUser.userId !== user.id) {\n      return res.status(401).json({ message: USER_ALREADY_EXISTING_MESSAGE });\n    }\n\n    const oldEmail = user.email;\n    const updatedEmail = userMetadataParsed.emailChangeWaitingForVerification;\n    delete userMetadataParsed.emailChangeWaitingForVerification;\n\n    // Update and re-verify\n    await prisma.user.update({\n      where: {\n        id: user.id,\n      },\n      data: {\n        email: updatedEmail,\n        metadata: userMetadataParsed,\n      },\n    });\n\n    if (IS_STRIPE_ENABLED && userMetadataParsed.stripeCustomerId) {\n        const billingService = { updateCustomer: async (_args: { customerId: string; email: string }) => {} };\n        await billingService.updateCustomer({\n          customerId: userMetadataParsed.stripeCustomerId,\n          email: updatedEmail,\n        });\n    }\n\n    // The user is trying to update the email to an already existing unverified secondary email of his\n    // so we swap the emails and its verified status\n    if (existingSecondaryUser?.userId === user.id) {\n      await prisma.secondaryEmail.update({\n        where: {\n          id: existingSecondaryUser.id,\n          userId: user.id,\n        },\n        data: {\n          email: oldEmail,\n          emailVerified: user.emailVerified,\n        },\n      });\n    }\n\n    await cleanUpVerificationTokens(foundToken.id);\n\n    return res.status(200).json({\n      updatedEmail,\n    });\n  }\n\n  await prisma.user.update({\n    where: {\n      id: user.id,\n    },\n    data: {\n      emailVerified: new Date(),\n    },\n  });\n\n  const hasCompletedOnboarding = user.completedOnboarding;\n\n  await moveUserToMatchingOrg({ email: user.email });\n\n  const gettingStartedPath = await OnboardingPathService.getGettingStartedPath();\n\n  return res.redirect(`${WEBAPP_URL}${hasCompletedOnboarding ? \"/event-types\" : gettingStartedPath}`);\n}",
    "endLine": 162,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-handler-ca648e6081",
    "sourcePath": "apps/web/lib/pages/auth/verify-email.ts",
    "startLine": 26,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/lib/pages/auth/verify-email.ts#L26-L162",
    "verifiedSourceHash": "sha256:056cabb8f76db0981869f2151038562f1915065c6c0957232d5b34834c0fca0f"
  },
  {
    "anchorId": "source-repository-health-complexity-processpaymentrefund-06206cf991",
    "code": "import { EventTypeMetaDataSchema } from \"@calcom/prisma/zod-utils\";\n\nexport const processPaymentRefund = async ({\n  booking,\n  teamId,\n}: {\n  booking: {\n    startTime: Date;\n    endTime: Date;\n    payment: Payment[];\n    eventType: {\n      owner?: {\n        id: number;\n      } | null;\n      metadata?: Prisma.JsonValue;\n    } | null;\n  };\n  teamId?: number | null;\n}) => {\n  const { startTime, eventType, payment } = booking;\n  if (!teamId && !eventType?.owner) return;\n\n  const successPayment = payment.find((p) => p.success);\n  if (!successPayment) return;\n\n  const eventTypeMetadata = EventTypeMetaDataSchema.parse(eventType?.metadata);\n  const appData = getPaymentAppData({\n    currency: successPayment.currency,\n    metadata: eventTypeMetadata,\n    price: successPayment.amount,\n  });\n\n  if (!appData?.refundPolicy || appData.refundPolicy === RefundPolicy.NEVER) return;\n\n  const credentialWhereClause: Prisma.CredentialFindManyArgs[\"where\"] = {\n    appId: successPayment.appId,\n  };\n  if (eventType?.owner) {\n    credentialWhereClause.userId = eventType.owner.id;\n  } else if (teamId) {\n    credentialWhereClause.teamId = teamId;\n  }\n\n  const paymentAppCredentials = await prisma.credential.findMany({\n    where: credentialWhereClause,\n    select: {\n      key: true,\n      appId: true,\n      app: {\n        select: {\n          categories: true,\n          dirName: true,\n        },\n      },\n    },\n  });\n\n  const paymentAppCredential = paymentAppCredentials.find((credential) => {\n    return credential.appId === successPayment.appId;\n  });\n\n  if (!paymentAppCredential) return;\n\n  const { refundPolicy, refundCountCalendarDays, refundDaysCount } = appData;\n\n  //refundDaysCount would always be present in case DAYS is selected, but adding it in AND jut for type safety\n  if (refundPolicy === RefundPolicy.DAYS && refundDaysCount) {\n    const refundDeadline =\n      refundCountCalendarDays === true\n        ? dayjs(startTime).subtract(refundDaysCount, \"days\")\n        : // businessDaysSubtract exists on extended dayjs instance, but ts is messing up\n          // eslint-disable-next-line @typescript-eslint/ban-ts-comment\n          //@ts-ignore\n          dayjs(startTime).businessDaysSubtract(refundDaysCount);\n    if (dayjs().isAfter(refundDeadline)) return;\n  }\n  await handlePaymentRefund(successPayment.id, paymentAppCredential);\n};",
    "endLine": 84,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-processpaymentrefund-06206cf991",
    "sourcePath": "packages/features/bookings/lib/payment/processPaymentRefund.ts",
    "startLine": 7,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/bookings/lib/payment/processPaymentRefund.ts#L7-L84",
    "verifiedSourceHash": "sha256:acb43e6d2621c31218473664ba9622db52b7f7d62893751adc7361e267d49f7d"
  },
  {
    "anchorId": "source-repository-health-complexity-main-88b488f1c0",
    "code": "const prisma = new PrismaClient();\n\nasync function main() {\n  // Dynamic import for ES module\n  const { FeaturesRepository } = await import(\"@calcom/features/flags/features.repository\");\n  const featuresRepository = new FeaturesRepository(prisma);\n  // Parse newEmail from args\n  const newEmail = process.argv[2] || \"hariom@cal.com\";\n  console.log(`Using newEmail: ${newEmail}`);\n\n  // 1. Update user email\n  let user = await prisma.user.findUnique({\n    where: { email: \"owner1-acme@example.com\" },\n  });\n  if (!user) {\n    // Check if user with newEmail exists\n    user = await prisma.user.findUnique({ where: { email: newEmail } });\n    if (user) {\n      console.log(`User with newEmail (${newEmail}) already exists. Skipping email update step.`);\n    } else {\n      console.error(\n        \"User with email owner1-acme@example.com not found, and user with newEmail also not found.\"\n      );\n      process.exit(1);\n    }\n  } else {\n    if (user.email !== newEmail) {\n      await prisma.user.update({\n        where: { id: user.id },\n        data: { email: newEmail },\n      });\n      console.log(`Updated user email to ${newEmail}`);\n    } else {\n      console.log(\"User email already set to newEmail, skipping update.\");\n    }\n  }\n\n  // 2. Find organization (Team)\n  const org = await prisma.team.findFirst({\n    where: { slug: \"acme\", isOrganization: true },\n  });\n  if (!org) {\n    console.error(\"Organization (Team) with slug=acme and isOrganization=true not found.\");\n    process.exit(1);\n  }\n  console.log(`Found organization: id=${org.id}, slug=${org.slug}`);\n\n  // 3. Ensure TeamFeatures: delegation-credential\n  const delegationFeature = await prisma.teamFeatures.findUnique({\n    where: {\n      teamId_featureId: {\n        teamId: org.id,\n        featureId: \"delegation-credential\",\n      },\n      enabled: true,\n    },\n  });\n  if (!delegationFeature) {\n    await featuresRepository.setTeamFeatureState({\n      teamId: org.id,\n      featureId: \"delegation-credential\",\n      state: \"enabled\",\n      assignedBy: \"prepare-local-script\",\n    });\n    console.log(\"Created TeamFeatures: delegation-credential\");\n  } else {\n    console.log(\"TeamFeatures: delegation-credential already exists, skipping.\");\n  }\n\n  // 4. Ensure TeamFeatures: calendar-cache\n  const calendarCacheFeature = await prisma.teamFeatures.findUnique({\n    where: {\n      teamId_featureId: {\n        teamId: org.id,\n        featureId: \"calendar-cache\",\n      },\n      enabled: true,\n    },\n  });\n  if (!calendarCacheFeature) {\n    await featuresRepository.setTeamFeatureState({\n      teamId: org.id,\n      featureId: \"calendar-cache\",\n      state: \"enabled\",\n      assignedBy: \"prepare-local-script\",\n    });\n    console.log(\"Created TeamFeatures: calendar-cache\");\n  } else {\n    console.log(\"TeamFeatures: calendar-cache already exists, skipping.\");\n  }\n\n  // 5. Add WorkspacePlatform record\n  const workspacePlatform = await prisma.workspacePlatform.findUnique({\n    where: { slug: \"google\" },\n  });\n  if (!workspacePlatform) {\n    await prisma.workspacePlatform.create({\n      data: {\n        slug: \"google\",\n        name: \"Google\",\n        enabled: true,\n        description: \"Google Workspace Platform\",\n        defaultServiceAccountKey: {}, // Empty object, update as needed\n      },\n    });\n    console.log(\"Created WorkspacePlatform: google\");\n  } else {\n    console.log(\"WorkspacePlatform: google already exists, skipping.\");\n  }\n\n  // 6. Enable Feature records for 'calendar-cache' and 'delegation-credential'\n  const featureSlugs = [\"calendar-cache\", \"delegation-credential\"];\n  for (const slug of featureSlugs) {\n    const feature = await prisma.feature.findUnique({ where: { slug } });\n    if (!feature) {\n      console.error(`Feature with slug ${slug} not found.`);\n      process.exit(1);\n    }\n    if (!feature.enabled) {\n      await prisma.feature.update({ where: { slug }, data: { enabled: true } });\n      console.log(`Enabled Feature: ${slug}`);\n    } else {\n      console.log(`Feature: ${slug} already enabled, skipping.`);\n    }\n  }\n  console.log(`Now you can sign in with ${newEmail} and create a new Delegation Credential.`);\n}",
    "endLine": 133,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "javascript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-main-88b488f1c0",
    "sourcePath": "scripts/prepare-local-for-delegation-credentials-testing.js",
    "startLine": 7,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/scripts/prepare-local-for-delegation-credentials-testing.js#L7-L133",
    "verifiedSourceHash": "sha256:72f2512e208a4a018dda71fb7e01d60bd5ec43dc51a104cc1059ccf8e25d1e80"
  },
  {
    "anchorId": "source-repository-health-complexity-chargecard-ab0958bd39",
    "code": "  }\n\n  async chargeCard(payment: Payment, bookingId: Booking[\"id\"]): Promise<Payment> {\n    try {\n      if (!this.credentials) {\n        throw new Error(\"Stripe credentials not found\");\n      }\n\n      const bookingRepository = new BookingRepository(prisma);\n      const booking = await bookingRepository.findByIdIncludeUserAndAttendees(bookingId);\n\n      if (!booking) {\n        throw new Error(`Booking ${bookingId} not found`);\n      }\n\n      const paymentObject = payment.data as unknown as StripeSetupIntentData;\n\n      const setupIntent = paymentObject.setupIntent;\n\n      // Ensure that the stripe customer & payment method still exists\n      const customer = await this.stripe.customers.retrieve(setupIntent.customer as string, {\n        stripeAccount: this.credentials.stripe_user_id,\n      });\n      const paymentMethod = await this.stripe.paymentMethods.retrieve(setupIntent.payment_method as string, {\n        stripeAccount: this.credentials.stripe_user_id,\n      });\n\n      if (!customer) {\n        throw new Error(`Stripe customer does not exist for setupIntent ${setupIntent.id}`);\n      }\n\n      if (!paymentMethod) {\n        throw new Error(`Stripe paymentMethod does not exist for setupIntent ${setupIntent.id}`);\n      }\n\n      if (!booking.attendees[0]) {\n        throw new Error(`Booking attendees are empty for setupIntent ${setupIntent.id}`);\n      }\n\n      const params: Stripe.PaymentIntentCreateParams = {\n        amount: payment.amount,\n        currency: payment.currency,\n        customer: setupIntent.customer as string,\n        payment_method: setupIntent.payment_method as string,\n        off_session: true,\n        confirm: true,\n        metadata: this.generateMetadata({\n          bookingId,\n          userId: booking.user?.id,\n          username: booking.user?.username,\n          bookerName: booking.attendees[0].name,\n          bookerEmail: booking.attendees[0].email,\n          bookerPhoneNumber: booking.attendees[0].phoneNumber ?? null,\n          eventTitle: booking.eventType?.title || null,\n          bookingTitle: booking.title,\n        }),\n      };\n\n      const paymentIntent = await this.stripe.paymentIntents.create(params, {\n        stripeAccount: this.credentials.stripe_user_id,\n      });\n\n      const paymentData = await prisma.payment.update({\n        where: {\n          id: payment.id,\n        },\n        data: {\n          success: true,\n          data: {\n            ...paymentObject,\n            paymentIntent,\n          } as unknown as Prisma.InputJsonValue,\n        },\n      });\n\n      if (!paymentData) {\n        throw new Error();\n      }\n\n      return paymentData;\n    } catch (error) {\n      log.error(\"Stripe: Could not charge card for payment\", bookingId, safeStringify(error));\n\n      const errorMappings = {\n        \"your card was declined\": \"your_card_was_declined\",\n        \"your card does not support this type of purchase\":\n          \"your_card_does_not_support_this_type_of_purchase\",\n        \"amount must convert to at least\": \"amount_must_convert_to_at_least\",\n      };\n\n      let userMessage = \"could_not_charge_card\";\n\n      if (error instanceof Error) {\n        const errorMessage = error.message.toLowerCase();\n\n        for (const [key, message] of Object.entries(errorMappings)) {\n          if (errorMessage.includes(key)) {\n            userMessage = message;\n            break;\n          }\n        }\n      }\n\n      throw new ErrorWithCode(ErrorCode.ChargeCardFailure, userMessage);\n    }\n  }",
    "endLine": 330,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-chargecard-ab0958bd39",
    "sourcePath": "packages/app-store/stripepayment/lib/PaymentService.ts",
    "startLine": 225,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/app-store/stripepayment/lib/PaymentService.ts#L225-L330",
    "verifiedSourceHash": "sha256:c5a97372d14599f4648401837bc4a2551e61de2d9e52ebdb9a39af11f126afbe"
  },
  {
    "anchorId": "source-repository-health-complexity-getconnecteddestinationcalendarsandensuredefaultsindb-64fa06b5af",
    "code": " * It also takes care of updating the destination calendar in some edge cases\n */\nexport async function getConnectedDestinationCalendarsAndEnsureDefaultsInDb({\n  user,\n  onboarding,\n  eventTypeId,\n  prisma,\n  skipSync,\n}: {\n  user: UserWithCalendars;\n  onboarding: boolean;\n  eventTypeId?: number | null;\n  prisma: PrismaClient;\n  skipSync?: boolean;\n}): Promise<{\n  destinationCalendar: DestinationCalendar & Omit<IntegrationCalendar, \"id\" | \"userId\">;\n  connectedCalendars: Awaited<ReturnType<typeof getConnectedCalendars>>[\"connectedCalendars\"];\n}> {\n  const userCredentials = await prisma.credential.findMany({\n    where: {\n      userId: user.id,\n      app: {\n        categories: { has: AppCategories.calendar },\n        enabled: true,\n      },\n    },\n    select: {\n      selectedCalendars: {\n        select: {\n          id: true,\n        },\n      },\n      ...credentialForCalendarServiceSelect,\n    },\n  });\n\n  const selectedCalendars = getSelectedCalendars({ user, eventTypeId: eventTypeId ?? null });\n  let connectedCalendars: Awaited<ReturnType<typeof getConnectedCalendars>>[\"connectedCalendars\"] = [];\n  let destinationCalendar: IntegrationCalendar | undefined;\n\n  const { credentials: allCredentials } = await enrichUserWithDelegationCredentialsIncludeServiceAccountKey({\n    user: { id: user.id, email: user.email, credentials: userCredentials },\n  });\n  // get user's credentials + their connected integrations\n  const calendarCredentials = getCalendarCredentials(allCredentials);\n\n  if (!skipSync) {\n    // get all the connected integrations' calendars (from third party)\n    const getConnectedCalendarsResult = await getConnectedCalendars(\n      calendarCredentials,\n      selectedCalendars,\n      user.destinationCalendar?.externalId\n    );\n\n    connectedCalendars = getConnectedCalendarsResult.connectedCalendars;\n    destinationCalendar = getConnectedCalendarsResult.destinationCalendar;\n\n    let calendarToEnsureIsEnabledForConflictCheck: ToggledCalendarDetails | null = null;\n\n    if (connectedCalendars.length === 0) {\n      user = await handleNoConnectedCalendars(user);\n    } else if (!user.destinationCalendar) {\n      ({ user, calendarToEnsureIsEnabledForConflictCheck, connectedCalendars } =\n        await handleNoDestinationCalendar({\n          user,\n          connectedCalendars,\n          onboarding,\n        }));\n    } else {\n      /* There are connected calendars and a destination calendar */\n      log.debug(\n        `There are connected calendars and a destination calendar, so check if destinationCalendar exists in connectedCalendars for user ${user.id}`\n      );\n\n      const destinationCal = findMatchingCalendar({ connectedCalendars, calendar: user.destinationCalendar });\n      if (!destinationCal) {\n        ({ user, calendarToEnsureIsEnabledForConflictCheck, connectedCalendars } =\n          await handleDestinationCalendarNotInConnectedCalendars({\n            user,\n            connectedCalendars,\n            onboarding,\n          }));\n      } else if (onboarding && !destinationCal.isSelected) {\n        log.debug(\n          `Onboarding:Destination calendar is not selected, but in connectedCalendars, so mark it as selected in the calendar list for user ${user.id}`\n        );\n        // Mark the destination calendar as selected in the calendar list\n        // We use every so that we can exit early once we find the matching calendar\n        connectedCalendars.every((cal) => {\n          const index = (cal.calendars || []).findIndex(\n            (calendar) =>\n              calendar.externalId === destinationCal.externalId &&\n              calendar.integration === destinationCal.integration\n          );\n          if (index >= 0 && cal.calendars) {\n            cal.calendars[index].isSelected = true;\n            calendarToEnsureIsEnabledForConflictCheck = {\n              externalId: destinationCal.externalId,\n              integration: destinationCal.integration || \"\",\n            };\n            return false;\n          }\n\n          return true;\n        });\n      }\n    }\n\n    // Insert the newly toggled record to the DB\n    if (calendarToEnsureIsEnabledForConflictCheck) {\n      await ensureSelectedCalendarIsInDb({\n        user,\n        selectedCalendar: calendarToEnsureIsEnabledForConflictCheck,\n        eventTypeId: eventTypeId ?? null,\n      });\n    }\n  }\n  // very explicit about skipping sync.\n  if (skipSync) {\n    // TODO: Make calendar types more flexible so this isn't needed\n    calendarCredentials.map(async (item) => {\n      const { integration } = item;\n      // TODO: Make calendar types more flexible somehow so this isn't needed\n      const credential: typeof item.credential & { selectedCalendars: { id: string }[] } =\n        item.credential as CredentialDataWithTeamName & { selectedCalendars: { id: string }[] };\n\n      const safeToSendIntegration = cleanIntegrationKeys(integration);\n      connectedCalendars.push({\n        integration: safeToSendIntegration,\n        credentialId: credential.id,\n        delegationCredentialId: credential.delegationCredentialId,\n        calendars: selectedCalendars\n          .filter((cal) =>\n            credential.selectedCalendars.some((appSelectedCal) => appSelectedCal.id === cal.id)\n          )\n          .map((cal) => ({\n            ...cal,\n            isSelected: true,\n            readOnly: false,\n            primary: null,\n            credentialId: credential.id,\n            delegationCredentialId: credential.delegationCredentialId,\n          })),\n      });\n    });\n  }\n\n  const noConflictingNonDelegatedConnectedCalendars = _ensureNoConflictingNonDelegatedConnectedCalendar({\n    connectedCalendars,\n    loggedInUser: { email: user.email },\n  });\n  let destinationCalendarWithoutIdAndUserId: Omit<IntegrationCalendar, \"id\" | \"userId\"> | null = null;\n  if (destinationCalendar) {\n    // ID and userID will be provided by user.destinationCalendar\n    const { id: _id, userId: _userId, ...partialDestCal } = destinationCalendar;\n    destinationCalendarWithoutIdAndUserId = partialDestCal;\n  }\n  return {\n    connectedCalendars: noConflictingNonDelegatedConnectedCalendars,\n    destinationCalendar: {\n      // biome-ignore lint/style/noNonNullAssertion: destinationCalendar is guaranteed to be non null here\n      ...user.destinationCalendar!,\n      ...destinationCalendarWithoutIdAndUserId,\n    },\n  };\n}",
    "endLine": 438,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-getconnecteddestinationcalendarsandensuredefaultsindb-64fa06b5af",
    "sourcePath": "packages/features/calendars/lib/getConnectedDestinationCalendars.ts",
    "startLine": 273,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/calendars/lib/getConnectedDestinationCalendars.ts#L273-L438",
    "verifiedSourceHash": "sha256:acd9227b39514dc66d2e9d1739b499aced29f7e20434158d506e2c1c11f97f53"
  },
  {
    "anchorId": "source-repository-health-complexity-findqualifiedhostswithdelegationcredentials-5cee6a9688",
    "code": "  }\n\n  async findQualifiedHostsWithDelegationCredentials(...args: unknown[]): Promise<{\n    qualifiedRRHosts: QualifiedHost[];\n    allFallbackRRHosts: QualifiedHost[];\n    fixedHosts: QualifiedHost[];\n  }> {\n    const input = (args[0] ?? {}) as Record<string, unknown>;\n    const eventType = (input.eventType ?? {}) as Record<string, unknown>;\n    const contactOwnerEmail = input.contactOwnerEmail as string | null | undefined;\n    const routedTeamMemberIds = (input.routedTeamMemberIds ?? []) as number[];\n\n    const hosts = (eventType.hosts ?? []) as Host[];\n    const users = (eventType.users ?? []) as User[];\n    const schedulingType = eventType.schedulingType as string | null | undefined;\n\n    if (hosts.length > 0) {\n      const fixedHosts: QualifiedHost[] = [];\n      const allRRHosts: QualifiedHost[] = [];\n\n      for (const host of hosts) {\n        const qualifiedHost: QualifiedHost = {\n          user: host.user,\n          isFixed: host.isFixed,\n          groupId: host.groupId ?? null,\n        };\n\n        if (host.isFixed || schedulingType !== \"ROUND_ROBIN\") {\n          fixedHosts.push(qualifiedHost);\n        } else {\n          allRRHosts.push(qualifiedHost);\n        }\n      }\n\n      let qualifiedRRHosts = allRRHosts;\n\n      if (contactOwnerEmail) {\n        const contactOwnerHost = allRRHosts.filter(\n          (h) => (h.user as { email?: string }).email === contactOwnerEmail\n        );\n        if (contactOwnerHost.length > 0) {\n          qualifiedRRHosts = contactOwnerHost;\n        }\n      } else if (routedTeamMemberIds.length > 0) {\n        const routedMemberIdSet = new Set(routedTeamMemberIds);\n        const routedHosts = allRRHosts.filter((h) => routedMemberIdSet.has((h.user as { id: number }).id));\n        if (routedHosts.length > 0) {\n          qualifiedRRHosts = routedHosts;\n        }\n      }\n\n      return { qualifiedRRHosts, allFallbackRRHosts: allRRHosts, fixedHosts };\n    }\n\n    if (users.length > 0) {\n      const fixedHosts = users.map((user) => ({\n        user,\n        isFixed: true as const,\n        groupId: null,\n      }));\n      return { qualifiedRRHosts: [], allFallbackRRHosts: [], fixedHosts };\n    }\n\n    return { qualifiedRRHosts: [], allFallbackRRHosts: [], fixedHosts: [] };\n  }",
    "endLine": 85,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-findqualifiedhostswithdelegationcredentials-5cee6a9688",
    "sourcePath": "apps/api/v2/src/lib/services/qualified-hosts.service.ts",
    "startLine": 21,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/api/v2/src/lib/services/qualified-hosts.service.ts#L21-L85",
    "verifiedSourceHash": "sha256:ec83e49b2f334769e723c080041b85c2c0750708bed3a1a8d346b7ae5d66a839"
  },
  {
    "anchorId": "source-repository-health-complexity-intersect-47fdb8081c",
    "code": "}\n\nexport function intersect(ranges: DateRange[][]): DateRange[] {\n  if (!ranges.length) {\n    return [];\n  }\n\n  type ProcessedDateRange = DateRange & { startValue: number; endValue: number };\n\n  // Pre-sort all user ranges and cache timestamp values.\n  const sortedRanges: ProcessedDateRange[][] = ranges.map((userRanges) =>\n    userRanges\n      .map((r) => ({\n        ...r,\n        startValue: r.start.valueOf(),\n        endValue: r.end.valueOf(),\n      }))\n      .sort((a, b) => a.startValue - b.startValue)\n  );\n\n  let commonAvailability: ProcessedDateRange[] = sortedRanges[0];\n\n  for (let i = 1; i < sortedRanges.length; i++) {\n    // Early exit if no common availability is left.\n    if (commonAvailability.length === 0) {\n      return [];\n    }\n\n    const userRanges = sortedRanges[i];\n    const intersectedRanges: ProcessedDateRange[] = [];\n\n    let commonIndex = 0;\n    let userIndex = 0;\n\n    while (commonIndex < commonAvailability.length && userIndex < userRanges.length) {\n      const commonRange = commonAvailability[commonIndex];\n      const userRange = userRanges[userIndex];\n\n      const intersectStartValue = Math.max(commonRange.startValue, userRange.startValue);\n      const intersectEndValue = Math.min(commonRange.endValue, userRange.endValue);\n\n      if (intersectStartValue < intersectEndValue) {\n        const intersectStart =\n          commonRange.startValue > userRange.startValue ? commonRange.start : userRange.start;\n        const intersectEnd = commonRange.endValue < userRange.endValue ? commonRange.end : userRange.end;\n        intersectedRanges.push({\n          start: intersectStart,\n          end: intersectEnd,\n          startValue: intersectStartValue,\n          endValue: intersectEndValue,\n        });\n      }\n\n      if (commonRange.endValue <= userRange.endValue) {\n        commonIndex++;\n      } else {\n        userIndex++;\n      }\n    }\n    commonAvailability = intersectedRanges;\n  }\n\n  // Strip the cached values before returning to match the expected DateRange[] type.\n  return commonAvailability.map(({ start, end }) => ({ start, end }));\n}",
    "endLine": 416,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-intersect-47fdb8081c",
    "sourcePath": "packages/features/schedules/lib/date-ranges.ts",
    "startLine": 352,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/schedules/lib/date-ranges.ts#L352-L416",
    "verifiedSourceHash": "sha256:33bc8445b06d8f45c7a6947375210f858ef40025bca35fe1d385c8a13bd6fec0"
  },
  {
    "anchorId": "source-repository-health-complexity-addhoststodb-aa1609363a",
    "code": "};\n\nasync function addHostsToDb(eventTypes: InputEventType[]) {\n  for (const eventType of eventTypes) {\n    // Create host groups first if they exist\n    if (eventType.hostGroups?.length) {\n      await prismock.hostGroup.createMany({\n        data: eventType.hostGroups.map((group) => ({\n          id: group.id, // Preserve the input ID\n          name: group.name,\n          eventTypeId: eventType.id,\n        })),\n      });\n    }\n\n    if (!eventType.hosts?.length) continue;\n    for (const host of eventType.hosts) {\n      const data: Prisma.HostCreateInput = {\n        eventType: {\n          connect: {\n            id: eventType.id,\n          },\n        },\n        isFixed: host.isFixed ?? false,\n        user: {\n          connect: {\n            id: host.userId,\n          },\n        },\n        schedule: host.scheduleId\n          ? {\n              connect: {\n                id: host.scheduleId,\n              },\n            }\n          : undefined,\n        group: host.groupId\n          ? {\n              connect: {\n                id: host.groupId,\n              },\n            }\n          : undefined,\n      };\n\n      await prismock.host.create({\n        data,\n      });\n\n      if (host.location) {\n        await prismock.hostLocation.create({\n          data: {\n            userId: host.userId,\n            eventTypeId: eventType.id,\n            type: host.location.type,\n            credentialId: host.location.credentialId ?? null,\n            link: host.location.link ?? null,\n            address: host.location.address ?? null,\n            phoneNumber: host.location.phoneNumber ?? null,\n          },\n        });\n      }\n    }\n  }\n}",
    "endLine": 378,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-addhoststodb-aa1609363a",
    "sourcePath": "packages/testing/src/lib/bookingScenario/bookingScenario.ts",
    "startLine": 314,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/testing/src/lib/bookingScenario/bookingScenario.ts#L314-L378",
    "verifiedSourceHash": "sha256:429ad6ac6c8d07abde8cc5d9935d789275cb0fde5cb2ce7c665692c0c9a69b46"
  },
  {
    "anchorId": "source-repository-health-complexity-fetchbookingsfromwebhook-c6b66e7bb1",
    "code": ");\n\nasync function fetchBookingsFromWebhook(\n  webhook: Pick<Webhook, \"id\" | \"userId\" | \"teamId\" | \"eventTypeId\">\n): Promise<Booking[]> {\n  const currentTime = new Date();\n  const where: Prisma.BookingWhereInput = {\n    AND: [{ status: BookingStatus.ACCEPTED }],\n    OR: [{ startTime: { gt: currentTime }, endTime: { gt: currentTime } }],\n  };\n\n  let bookings: Booking[] = [];\n\n  if (Array.isArray(where.AND)) {\n    if (webhook.teamId) {\n      const org = await prisma.team.findFirst({\n        where: {\n          id: webhook.teamId,\n          isOrganization: true,\n        },\n        select: {\n          id: true,\n          children: {\n            select: {\n              id: true,\n            },\n          },\n          members: {\n            select: {\n              userId: true,\n            },\n          },\n        },\n      });\n      // checking if teamId is an org id\n      if (org) {\n        const teamEvents = await prisma.eventType.findMany({\n          where: {\n            teamId: {\n              in: org.children.map((team) => team.id),\n            },\n          },\n          select: {\n            bookings: {\n              where,\n            },\n          },\n        });\n        const teamEventBookings = teamEvents.flatMap((event) => event.bookings);\n        const teamBookingsId = teamEventBookings.map((booking) => booking.id);\n        const orgMemberIds = org.members.map((member) => member.userId);\n        where.AND.push({\n          userId: {\n            in: orgMemberIds,\n          },\n        });\n        // don't want to get the team bookings again\n        where.AND.push({\n          id: {\n            notIn: teamBookingsId,\n          },\n        });\n        const userBookings = await prisma.booking.findMany({\n          where,\n        });\n        // add teams bookings and users bookings to get total org bookings\n        bookings = teamEventBookings.concat(userBookings);\n      } else {\n        const teamEvents = await prisma.eventType.findMany({\n          where: {\n            teamId: webhook.teamId,\n          },\n          select: {\n            bookings: {\n              where,\n            },\n          },\n        });\n\n        bookings = teamEvents.flatMap((event) => event.bookings);\n      }\n    } else {\n      if (webhook.eventTypeId) {\n        where.AND.push({ eventTypeId: webhook.eventTypeId });\n      } else if (webhook.userId) {\n        where.AND.push({ userId: webhook.userId });\n      }\n\n      bookings = await prisma.booking.findMany({\n        where,\n      });\n    }\n  }\n\n  return bookings;\n}",
    "endLine": 477,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-fetchbookingsfromwebhook-c6b66e7bb1",
    "sourcePath": "packages/features/webhooks/lib/scheduleTrigger.ts",
    "startLine": 382,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/webhooks/lib/scheduleTrigger.ts#L382-L477",
    "verifiedSourceHash": "sha256:faea79189dac8e6497a8f8d81f83dc506ef4711662322272a02e75f1989f0939"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-1cb0f406ad",
    "code": "      <div className=\"text-subtle text-sm font-medium\">{t(\"install_app_on\")}</div>\n      <div className={classNames(\"mt-2 flex flex-col gap-2 \")}>\n        <AccountSelector\n          testId=\"install-app-button-personal\"\n          avatar={personalAccount.avatarUrl ?? \"\"}\n          name={personalAccount.name ?? \"\"}\n          alreadyInstalled={personalAccount.alreadyInstalled}\n          onClick={() => onSelect()}\n          loading={loading}\n        />\n        {installableOnTeams &&\n          teams?.map((team) => (\n            <AccountSelector\n              key={team.id}\n              testId={`install-app-button-team${team.id}`}\n              alreadyInstalled={team.alreadyInstalled}\n              avatar={team.logoUrl ?? \"\"}\n              name={team.name}\n              onClick={() => onSelect(team.id)}\n              loading={loading}\n            />\n          ))}\n      </div>\n    </StepCard>\n  );\n};",
    "endLine": 104,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-1cb0f406ad",
    "sourcePath": "apps/web/components/apps/installation/AccountsStepCard.tsx",
    "startLine": 79,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/components/apps/installation/AccountsStepCard.tsx#L79-L104",
    "verifiedSourceHash": "sha256:e37b6cde9b438a46634ce41c17ecf11b6a705c629cfe1d5b03c4107c3cd08546"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-8a515ce34d",
    "code": "              <EventTypeAppSettingsWrapper {...props} />\n            )}\n            <Icon\n              name=\"x\"\n              data-testid={`remove-event-type-${eventType.id}`}\n              className=\"absolute right-4 top-4 h-4 w-4 cursor-pointer\"\n              onClick={() => !loading && handleDelete()}\n            />\n            <button type=\"submit\" className=\"hidden\" form={`eventtype-${eventType.id}`} ref={ref}>\n              Save\n            </button>\n          </div>\n        </div>\n      </Form>\n    );\n  }\n);\n\nconst EventTypeGroup = ({\n  groupIndex,\n  eventTypeGroups,\n  setUpdatedEventTypesStatus,\n  submitRefs,\n  ...props\n}: ConfigureStepCardProps & {\n  groupIndex: number;\n  setUpdatedEventTypesStatus: Dispatch<SetStateAction<TUpdatedEventTypesStatus>>;",
    "endLine": 132,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-8a515ce34d",
    "sourcePath": "apps/web/components/apps/installation/ConfigureStepCard.tsx",
    "startLine": 106,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/components/apps/installation/ConfigureStepCard.tsx#L106-L132",
    "verifiedSourceHash": "sha256:8722e41437b15ab80be7d5948aa97d6fb522222d5360d61ceaa4d15f872e909f"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-f845552ae8",
    "code": "                key={cancelEventAction.id}\n                disabled={cancelEventAction.disabled}>\n                <DropdownItem\n                  type=\"button\"\n                  color={cancelEventAction.color}\n                  StartIcon={cancelEventAction.icon}\n                  onClick={(e) => {\n                    e.stopPropagation();\n                    setIsCancelDialogOpen(true);\n                  }}\n                  disabled={cancelEventAction.disabled}\n                  data-booking-uid={cancelEventAction.bookingUid}\n                  data-testid={cancelEventAction.id}\n                  className={cancelEventAction.disabled ? \"text-muted\" : undefined}>\n                  {cancelEventAction.label}\n                </DropdownItem>\n              </DropdownMenuItem>\n            </Tooltip>\n          </DropdownMenuContent>\n        </ConditionalPortal>\n      </Dropdown>\n    </>\n  );\n}",
    "endLine": 674,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-f845552ae8",
    "sourcePath": "apps/web/components/booking/actions/BookingActionsDropdown.tsx",
    "startLine": 651,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/components/booking/actions/BookingActionsDropdown.tsx#L651-L674",
    "verifiedSourceHash": "sha256:c9e338c37396007d882c9d9943d723ded7703d7ef4af4a47234ef27244197968"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-447b26a39d",
    "code": "          <div className=\"flex h-full items-center\">\n            {eventTypeColor && <div className=\"h-[70%] w-0.5\" style={{ backgroundColor: eventTypeColor }} />}\n            <ConditionalLink onClick={onClick} bookingLink={bookingLink} className=\"ml-3\">\n              <div className=\"cursor-pointer py-4\">\n                <div className=\"text-emphasis text-sm leading-6\">{startTime}</div>\n                <div className=\"text-subtle text-sm\">\n                  {formatTime(booking.startTime, userTimeFormat, userTimeZone)} -{\" \"}\n                  {formatTime(booking.endTime, userTimeFormat, userTimeZone)}\n                  <MeetingTimeInTimezones\n                    timeFormat={userTimeFormat}\n                    userTimezone={userTimeZone}\n                    startTime={booking.startTime}\n                    endTime={booking.endTime}\n                    attendees={booking.attendees}\n                  />\n                </div>\n                {!isPending && (\n                  <div>\n                    {(provider?.label ||\n                      (typeof locationToDisplay === \"string\" && locationToDisplay?.startsWith(\"https://\"))) &&\n                      locationToDisplay.startsWith(\"http\") && (\n                        <a\n                          href={locationToDisplay}\n                          onClick={(e) => e.stopPropagation()}\n                          target=\"_blank\"\n                          title={locationToDisplay}\n                          rel=\"noreferrer\"",
    "endLine": 319,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-447b26a39d",
    "sourcePath": "apps/web/components/booking/BookingListItem.tsx",
    "startLine": 293,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/components/booking/BookingListItem.tsx#L293-L319",
    "verifiedSourceHash": "sha256:8832fe6cf01634f2e84a175a3bfafbb6cc5858b6e8633c887ea613cc18773fb8"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-7e474b6d7e",
    "code": "          data-testid=\"title-and-attendees\"\n          className={classNames(\"flex-1 px-4\", isRejected && \"line-through\")}>\n          <ConditionalLink onClick={onClick} bookingLink={bookingLink} className=\"flex h-full flex-col\">\n            {/* Time and Badges for mobile */}\n            <div className=\"w-full pb-2 pt-4 sm:hidden\">\n              <div className=\"flex w-full items-center justify-between sm:hidden\">\n                <div className=\"text-emphasis text-sm leading-6\">{startTime}</div>\n                <div className=\"text-subtle pr-2 text-sm\">\n                  {formatTime(booking.startTime, userTimeFormat, userTimeZone)} -{\" \"}\n                  {formatTime(booking.endTime, userTimeFormat, userTimeZone)}\n                  <MeetingTimeInTimezones\n                    timeFormat={userTimeFormat}\n                    userTimezone={userTimeZone}\n                    startTime={booking.startTime}\n                    endTime={booking.endTime}\n                    attendees={booking.attendees}\n                  />\n                </div>\n              </div>\n\n              {isPending && (\n                <Badge className=\"ltr:mr-2 rtl:ml-2 sm:hidden\" variant=\"orange\">\n                  {t(\"unconfirmed\")}\n                </Badge>\n              )}\n              {booking.eventType?.team && (\n                <Badge className=\"ltr:mr-2 rtl:ml-2 sm:hidden\" variant=\"gray\">",
    "endLine": 371,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-7e474b6d7e",
    "sourcePath": "apps/web/components/booking/BookingListItem.tsx",
    "startLine": 345,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/components/booking/BookingListItem.tsx#L345-L371",
    "verifiedSourceHash": "sha256:9f89f53c192ccb8b711f066a1b7a30035b23bc549100795ba081e8129097f64d"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-e273c4d504",
    "code": "\n          <DropdownMenuItem className=\"focus:outline-none\">\n            <DropdownItem\n              StartIcon={isCopied ? \"clipboard-check\" : \"clipboard\"}\n              onClick={(e) => {\n                e.preventDefault();\n                const isEmailCopied = isSmsCalEmail(email);\n                copyToClipboard(isEmailCopied ? email : (phoneNumber ?? \"\"));\n                setOpenDropdown(false);\n                showToast(isEmailCopied ? t(\"email_copied\") : t(\"phone_number_copied\"), \"success\");\n              }}>\n              {!isCopied ? t(\"copy\") : t(\"copied\")}\n            </DropdownItem>\n          </DropdownMenuItem>\n\n          {isBookingInPast && (\n            <DropdownMenuItem className=\"focus:outline-none\">\n              <DropdownItem\n                data-testid={noShow ? \"unmark-no-show\" : \"mark-no-show\"}\n                onClick={(e) => {\n                  e.preventDefault();\n                  setOpenDropdown(false);\n                  noShowMutation.mutate({ bookingUid, attendees: [{ noShow: !noShow, email }] });\n                }}\n                StartIcon={noShow ? \"eye\" : \"eye-off\"}>\n                {noShow ? t(\"unmark_as_no_show\") : t(\"mark_as_no_show\")}\n              </DropdownItem>",
    "endLine": 851,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-e273c4d504",
    "sourcePath": "apps/web/components/booking/BookingListItem.tsx",
    "startLine": 825,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/components/booking/BookingListItem.tsx#L825-L851",
    "verifiedSourceHash": "sha256:b32320b2f3944d7db0ede645dd7ef137ef7532a688e484cf68729fc23826d2f5"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-d900f5da51",
    "code": "  return (\n    <Tooltip content={<p>{assignmentReason.reasonString}</p>}>\n      <Badge\n        className={classNames(\"ltr:mr-2 rtl:ml-2\", onClick && \"cursor-pointer hover:opacity-80\")}\n        variant=\"gray\"\n        onClick={onClick}>\n        {t(badgeTitle)}\n      </Badge>\n    </Tooltip>\n  );\n};\n\n// Wrap BookingListItem with BookingActionsStoreProvider to provide isolated store for each booking\nconst BookingListItemWithProvider = (props: BookingItemProps) => {\n  return (\n    <BookingActionsStoreProvider>\n      <BookingListItem {...props} />\n    </BookingActionsStoreProvider>\n  );\n};\n\nexport default BookingListItemWithProvider;",
    "endLine": 1157,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-d900f5da51",
    "sourcePath": "apps/web/components/booking/BookingListItem.tsx",
    "startLine": 1136,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/components/booking/BookingListItem.tsx#L1136-L1157",
    "verifiedSourceHash": "sha256:f9aadf7b9ca624b6ddbee957631825ea1fa30aa9d8536101e6bf076bd66c3383"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-16d7b9b88c",
    "code": "            <DropdownMenuContent>\n              <DropdownMenuItem>\n                <DropdownItem\n                  StartIcon=\"flag\"\n                  color=\"secondary\"\n                  className=\"disabled:opacity-40\"\n                  onClick={handleChangePrimary}\n                  disabled={!emailVerified || emailPrimary}\n                  data-testid=\"secondary-email-make-primary-button\">\n                  {t(\"make_primary\")}\n                </DropdownItem>\n              </DropdownMenuItem>\n              {!emailVerified && (\n                <DropdownMenuItem>\n                  <DropdownItem\n                    StartIcon=\"send\"\n                    color=\"secondary\"\n                    className=\"disabled:opacity-40\"\n                    onClick={handleVerifyEmail}\n                    disabled={emailVerified}\n                    data-testid=\"resend-verify-email-button\">\n                    {t(\"resend_email\")}\n                  </DropdownItem>\n                </DropdownMenuItem>\n              )}\n              <DropdownMenuItem>\n                <DropdownItem",
    "endLine": 107,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-16d7b9b88c",
    "sourcePath": "apps/web/components/settings/CustomEmailTextField.tsx",
    "startLine": 81,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/components/settings/CustomEmailTextField.tsx#L81-L107",
    "verifiedSourceHash": "sha256:ce48143a9575f893a2d8c14a9a3961f96276a29b027e6d910cdce979a819ab2a"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-2e38d7bcac",
    "code": "              )}\n              <DropdownMenuItem>\n                <DropdownItem\n                  StartIcon=\"trash\"\n                  color=\"destructive\"\n                  className=\"rounded-t-none disabled:opacity-40\"\n                  onClick={handleItemDelete}\n                  disabled={emailPrimary}\n                  data-testid=\"secondary-email-delete-button\">\n                  {t(\"delete\")}\n                </DropdownItem>\n              </DropdownMenuItem>\n            </DropdownMenuContent>\n          </Dropdown>\n        </div>\n      </div>\n      {errorMessage && <InputError message={errorMessage} />}\n    </>\n  );\n};\n\nexport default CustomEmailTextField;",
    "endLine": 126,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-2e38d7bcac",
    "sourcePath": "apps/web/components/settings/CustomEmailTextField.tsx",
    "startLine": 105,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/components/settings/CustomEmailTextField.tsx#L105-L126",
    "verifiedSourceHash": "sha256:b7ad9e5df577b032438b820b7382bc06033f659fc76f3268d1ffce4661aa4c0e"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-d5446cf7ed",
    "code": "        data-testid=\"secondary-email-confirm-dialog\">\n        <DialogFooter>\n          <DialogClose color=\"primary\" onClick={onCancel} data-testid=\"secondary-email-confirm-done-button\">\n            {t(\"done\")}\n          </DialogClose>\n        </DialogFooter>\n      </DialogContent>\n    </Dialog>\n  );\n};\n\nexport default SecondaryEmailConfirmModal;",
    "endLine": 31,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-d5446cf7ed",
    "sourcePath": "apps/web/components/settings/SecondaryEmailConfirmModal.tsx",
    "startLine": 20,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/components/settings/SecondaryEmailConfirmModal.tsx#L20-L31",
    "verifiedSourceHash": "sha256:5aaff7056a0d876307d2ab3a0c5b96b6d3032fe0e3847ce97798fef9eb06368e"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-36ec9f5830",
    "code": "          {errorMessage && <InputError message={errorMessage} />}\n          <DialogFooter showDivider className=\"mt-10\">\n            <DialogClose onClick={onCancel}>{t(\"cancel\")}</DialogClose>\n            <Button type=\"submit\" data-testid=\"add-secondary-email-button\" disabled={isLoading}>\n              {t(\"add_email\")}\n            </Button>\n          </DialogFooter>\n        </Form>\n      </DialogContent>\n    </Dialog>\n  );\n};\n\nexport default SecondaryEmailModal;",
    "endLine": 73,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-36ec9f5830",
    "sourcePath": "apps/web/components/settings/SecondaryEmailModal.tsx",
    "startLine": 60,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/components/settings/SecondaryEmailModal.tsx#L60-L73",
    "verifiedSourceHash": "sha256:8449a4b870e34dd803d6f8e69bbf56e082851fdac84d9b4c27a18039ebfd93ed"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-8a289ca780",
    "code": "          />\n          {option.label}\n          <Icon\n            name=\"x\"\n            onClick={() => props.onChange(value.filter((item) => item.value !== option.value))}\n            className=\"text-subtle float-right mt-0.5 h-5 w-5 cursor-pointer\"\n          />\n        </div>\n      ))}\n    </>\n  );\n};\n\nexport default CheckedSelect;",
    "endLine": 56,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-8a289ca780",
    "sourcePath": "apps/web/components/ui/form/CheckedSelect.tsx",
    "startLine": 43,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/components/ui/form/CheckedSelect.tsx#L43-L56",
    "verifiedSourceHash": "sha256:6bf364089a51ea690893b1eef3e3562244370cc2ecfb4b7ad96d432253a0f820"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-c67d9069fb",
    "code": "              </Button>\n            )}\n            <DialogClose color=\"secondary\" onClick={() => setOpenDialogSaveUsername(false)}>\n              {t(\"cancel\")}\n            </DialogClose>\n          </DialogFooter>\n        </DialogContent>\n      </Dialog>\n    </div>\n  );\n};\n\nexport { PremiumTextfield };",
    "endLine": 337,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-c67d9069fb",
    "sourcePath": "apps/web/components/ui/UsernameAvailability/PremiumTextfield.tsx",
    "startLine": 325,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/components/ui/UsernameAvailability/PremiumTextfield.tsx#L325-L337",
    "verifiedSourceHash": "sha256:4b974bbebc19e6f69ac59558540db3d67042b310aea67c2dc2fdd31bedcf2f42"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-6b24d243e3",
    "code": "            </Button>\n\n            <DialogClose color=\"secondary\" onClick={() => setOpenDialogSaveUsername(false)}>\n              {t(\"cancel\")}\n            </DialogClose>\n          </DialogFooter>\n        </DialogContent>\n      </Dialog>\n    </div>\n  );\n};\n\nexport { UsernameTextfield };",
    "endLine": 213,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-6b24d243e3",
    "sourcePath": "apps/web/components/ui/UsernameAvailability/UsernameTextfield.tsx",
    "startLine": 201,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/components/ui/UsernameAvailability/UsernameTextfield.tsx#L201-L213",
    "verifiedSourceHash": "sha256:f4d667089614c578a380a4c6adc325b8a579857870e33c72086f4114bd76c0fc"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-31ad0f6949",
    "code": "          <DropdownMenuContent>\n            <DropdownMenuItem>\n              <DropdownItem type=\"button\" onClick={onEditClick} StartIcon=\"pencil\">\n                {t(\"edit\") as string}\n              </DropdownItem>\n            </DropdownMenuItem>\n            <DropdownMenuItem>\n              <DropdownItem\n                type=\"button\"\n                color=\"destructive\"\n                disabled={deleteApiKey.isPending}\n                onClick={() => setDeleteDialogOpen(true)}\n                StartIcon=\"trash\"\n                className=\"rounded-t-none\">\n                {t(\"delete\") as string}\n              </DropdownItem>\n            </DropdownMenuItem>\n          </DropdownMenuContent>\n        </Dropdown>\n      </div>\n\n      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>\n        <ConfirmationDialogContent\n          variety=\"danger\"\n          title={t(\"delete_api_key_confirm_title\")}\n          confirmBtnText={t(\"confirm_delete_api_key\")}\n          loadingText={t(\"confirm_delete_api_key\")}",
    "endLine": 107,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-31ad0f6949",
    "sourcePath": "apps/web/modules/api-keys/api-keys/components/ApiKeyListItem.tsx",
    "startLine": 81,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/api-keys/api-keys/components/ApiKeyListItem.tsx#L81-L107",
    "verifiedSourceHash": "sha256:86c95111d0c758c085281b0cf1d66a963a7e2c277d28c098cde2e69edb1bc163"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-4737ae4f75",
    "code": "            </DropdownMenuItem>\n            <DropdownMenuItem>\n              <DropdownItem\n                type=\"button\"\n                color=\"destructive\"\n                disabled={deleteApiKey.isPending}\n                onClick={() => setDeleteDialogOpen(true)}\n                StartIcon=\"trash\"\n                className=\"rounded-t-none\">\n                {t(\"delete\") as string}\n              </DropdownItem>\n            </DropdownMenuItem>\n          </DropdownMenuContent>\n        </Dropdown>\n      </div>\n\n      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>\n        <ConfirmationDialogContent\n          variety=\"danger\"\n          title={t(\"delete_api_key_confirm_title\")}\n          confirmBtnText={t(\"confirm_delete_api_key\")}\n          loadingText={t(\"confirm_delete_api_key\")}\n          isPending={deleteApiKey.isPending}\n          onConfirm={() => {\n            deleteApiKey.mutate({\n              id: apiKey.id,\n            });",
    "endLine": 112,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-4737ae4f75",
    "sourcePath": "apps/web/modules/api-keys/api-keys/components/ApiKeyListItem.tsx",
    "startLine": 86,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/api-keys/api-keys/components/ApiKeyListItem.tsx#L86-L112",
    "verifiedSourceHash": "sha256:7407a49aa49bd5304a767cb2c33d5c9ba3db1479258d5d50326fe12ed71aa270"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-ee9d075099",
    "code": "        )}\n        <DialogFooter showDivider className=\"mt-8\">\n          <DialogClose onClick={handleModelClose} />\n          <Button form=\"edit-keys\" type=\"submit\">\n            {t(\"save\")}\n          </Button>\n        </DialogFooter>\n      </DialogContent>\n    </Dialog>\n  );\n};\n\ninterface EditModalState extends Pick<App, \"keys\"> {\n  isOpen: \"none\" | \"editKeys\" | \"disableKeys\";\n  dirName: string;\n  type: string;\n  slug: string;\n  fromEnabled?: boolean;\n  appName?: string;\n}\n\nconst AdminAppsListContainer = () => {\n  const searchParams = useCompatSearchParams();\n  const { t } = useLocale();\n  const category = searchParams?.get(\"category\") || AppCategories.calendar;\n\n  const { data: apps, isPending } = trpc.viewer.apps.listLocal.useQuery(",
    "endLine": 283,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-ee9d075099",
    "sourcePath": "apps/web/modules/apps/components/AdminAppsList.tsx",
    "startLine": 257,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/apps/components/AdminAppsList.tsx#L257-L283",
    "verifiedSourceHash": "sha256:7a929c3de5dee9dde35491d89607ac5f96e3bfbf9bb629d6528666761e1fb480"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-8c10e01ea8",
    "code": "        onScroll={(e) => calculateScroll(e)}\n        ref={ref}>\n        <li\n          onClick={() => {\n            onCategoryChange(null);\n          }}\n          className={classNames(\n            selectedCategory === null ? \"bg-emphasis text-default\" : \"bg-cal-muted text-emphasis\",\n            \"hover:bg-emphasis min-w-max rounded-md px-4 py-2.5 text-sm font-medium transition hover:cursor-pointer\"\n          )}>\n          {t(\"all\")}\n        </li>\n        {categories.map((cat, pos) => (\n          <li\n            key={pos}\n            onClick={() => {\n              if (selectedCategory === cat) {\n                onCategoryChange(null);\n              } else {\n                onCategoryChange(cat);\n              }\n            }}\n            className={classNames(\n              selectedCategory === cat ? \"bg-emphasis text-default\" : \"bg-cal-muted text-emphasis\",\n              \"hover:bg-emphasis rounded-md px-4 py-2.5 text-sm font-medium transition hover:cursor-pointer\"\n            )}>\n            {cat === \"crm\" ? cat.toUpperCase() : cat[0].toUpperCase() + cat.slice(1)}",
    "endLine": 126,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-8c10e01ea8",
    "sourcePath": "apps/web/modules/apps/components/AllApps.tsx",
    "startLine": 100,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/apps/components/AllApps.tsx#L100-L126",
    "verifiedSourceHash": "sha256:d7dc7ac1224862fc365a7800eec47cdaaade57508ec873c45ff99aa7bf7bc8c0"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-a40e8c206a",
    "code": "              <DropdownMenuContent>\n                <DropdownMenuItem>\n                  <DropdownItem type=\"button\" StartIcon=\"eye\" onClick={() => onViewDetails(entry)}>\n                    {t(\"view_details\")}\n                  </DropdownItem>\n                </DropdownMenuItem>\n                {showDeleteOption && (\n                  <DropdownMenuItem>\n                    <DropdownItem\n                      type=\"button\"\n                      color=\"destructive\"\n                      StartIcon=\"trash\"\n                      onClick={() => onDelete(entry)}>\n                      {t(\"remove_from_blocklist\")}\n                    </DropdownItem>\n                  </DropdownMenuItem>\n                )}\n              </DropdownMenuContent>\n            </Dropdown>\n          </div>\n        );\n      },\n    });\n\n    return columns;\n  }, [t, scope, isSystem, canDelete, enableRowSelection, onViewDetails, onDelete]);\n}",
    "endLine": 167,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-a40e8c206a",
    "sourcePath": "apps/web/modules/blocklist/components/BlockedEntriesColumns.tsx",
    "startLine": 141,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/blocklist/components/BlockedEntriesColumns.tsx#L141-L167",
    "verifiedSourceHash": "sha256:c47fc295a810eb9f53daf3be1c425808b185e5ef1b4f76c523f6333356f606fa"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-9714b8696b",
    "code": "              <DropdownMenuContent>\n                <DropdownMenuItem>\n                  <DropdownItem type=\"button\" StartIcon=\"eye\" onClick={() => onViewDetails(entry)}>\n                    {t(\"view_details\")}\n                  </DropdownItem>\n                </DropdownMenuItem>\n              </DropdownMenuContent>\n            </Dropdown>\n          </div>\n        );\n      },\n    });\n\n    return columns;\n  }, [t, scope, isSystem, enableRowSelection, onViewDetails]);\n}",
    "endLine": 160,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-9714b8696b",
    "sourcePath": "apps/web/modules/blocklist/components/PendingReportsColumns.tsx",
    "startLine": 145,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/blocklist/components/PendingReportsColumns.tsx#L145-L160",
    "verifiedSourceHash": "sha256:b94e0f6e0bcfae1c7929c61ec026d2b201217cdeab43c935badd37720a185fa4"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-829817b892",
    "code": "          enableOverflow\n          className=\"fixed! inset-0! top-0! left-0! h-screen! max-h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! rounded-none! m-0! px-8 pt-0 pb-8\">\n          <SlotSelectionModalHeader\n            onClick={() => setIsSlotSelectionModalVisible(false)}\n            event={event.data}\n            isPlatform={isPlatform}\n            timeZones={timeZones}\n            selectedDate={selectedDate}\n          />\n          <AvailableTimeSlots\n            onAvailableTimeSlotSelect={onAvailableTimeSlotSelect}\n            customClassNames={customClassNames?.availableTimeSlotsCustomClassNames}\n            extraDays={extraDays}\n            limitHeight={layout === BookerLayouts.MONTH_VIEW}\n            schedule={schedule}\n            isLoading={schedule.isPending}\n            seatsPerTimeSlot={event.data?.seatsPerTimeSlot}\n            unavailableTimeSlots={unavailableTimeSlots}\n            showAvailableSeatsCount={event.data?.seatsShowAvailabilityCount}\n            event={event}\n            loadingStates={loadingStates}\n            renderConfirmNotVerifyEmailButtonCond={renderConfirmNotVerifyEmailButtonCond}\n            isVerificationCodeSending={isVerificationCodeSending}\n            onSubmit={onSubmit}\n            skipConfirmStep={skipConfirmStep}\n            shouldRenderCaptcha={shouldRenderCaptcha}\n            watchedCfToken={watchedCfToken}",
    "endLine": 619,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-829817b892",
    "sourcePath": "apps/web/modules/bookings/components/Booker.tsx",
    "startLine": 593,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/bookings/components/Booker.tsx#L593-L619",
    "verifiedSourceHash": "sha256:1f8d1f5ca879a00ff550ed6ee0ea7a748cea79130aa5de000bc244b4740ffce1"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-e30be7bda2",
    "code": "            )}\n            <DialogFooter noSticky>\n              <DialogClose onClick={() => setIsOpenDialog(false)} />\n              <Button type=\"submit\" onClick={verifyCode} loading={isPending}>\n                {t(\"submit\")}\n              </Button>\n            </DialogFooter>\n          </div>\n        </div>\n      </DialogContent>\n    </Dialog>\n  );\n};",
    "endLine": 133,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-e30be7bda2",
    "sourcePath": "apps/web/modules/bookings/components/VerifyCodeDialog.tsx",
    "startLine": 121,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/bookings/components/VerifyCodeDialog.tsx#L121-L133",
    "verifiedSourceHash": "sha256:764fef4dba3e19142bad118640f0c19f8926bbd9fcf6f004b655f49ed0bfba36"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-6a8e4d9d1a",
    "code": "  return (\n    <Tooltip content={tooltipContent} className=\"max-w-none\" side={tooltipSide}>\n      <Component\n        data-booking-calendar-event=\"true\"\n        onClick={() => onEventClick?.(event)}\n        {...(options?.bookingUid ? { \"data-booking-uid\": options.bookingUid } : {})}\n        className={classNames(\n          eventClasses({\n            status: options?.status,\n            disabled,\n            selected,\n            borderOnly: options?.borderOnly ?? false,\n          }),\n          options?.className,\n          (isHovered || selected) && \"ring-brand-default shadow-lg ring-2 ring-offset-0\"\n        )}\n        style={{\n          transition: \"all 100ms ease-out\",\n        }}>\n        {(options?.color || colorClass) && (\n          <div\n            className={classNames(\"-ml-1.5 mr-1.5 h-full w-[3px] shrink-0\", colorClass)}\n            style={options?.color ? { backgroundColor: options.color } : undefined}></div>\n        )}\n        <div className={classNames(\"flex w-full\", displayType !== \"single-line\" && \"flex-col py-1\")}>\n          {displayType === \"single-line\" && (\n            <div",
    "endLine": 135,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-6a8e4d9d1a",
    "sourcePath": "apps/web/modules/calendars/weeklyview/components/event/Event.tsx",
    "startLine": 109,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/calendars/weeklyview/components/event/Event.tsx#L109-L135",
    "verifiedSourceHash": "sha256:d8e2f58f485d95c5343cc619ccec99d33c6b5969c0e165a24923fa36969f914b"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-7fdb8c3c02",
    "code": "\n  return (\n    <Component\n      {...props}\n      className={className}\n      data-test-embed-url={embedUrl}\n      data-testid=\"embed\"\n      type=\"button\"\n      onClick={openEmbedModal}>\n      {children}\n    </Component>\n  );\n};",
    "endLine": 1485,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-7fdb8c3c02",
    "sourcePath": "apps/web/modules/embed/components/Embed.tsx",
    "startLine": 1473,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/embed/components/Embed.tsx#L1473-L1485",
    "verifiedSourceHash": "sha256:8ab2b6260bbafcc48ac9d6e87f806c812182466a0c36a50553d7ee5cbbabf219"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-93d03e42e2",
    "code": "      <div className=\"mb-8\" />\n      <DialogFooter showDivider>\n        <DialogClose onClick={() => hideDialogFor([3, \"months\"], t(\"we_wont_show_again\"))} color=\"secondary\">\n          {t(\"dont_update\")}\n        </DialogClose>\n        <DialogClose onClick={() => updateTimezone()} color=\"primary\">\n          {t(\"update_timezone\")}\n        </DialogClose>\n      </DialogFooter>\n    </>\n  );\n};\n\nexport function useOpenTimezoneDialog() {\n  const { data: user } = trpc.viewer.me.get.useQuery();\n  const [showDialog, setShowDialog] = useState(false);\n  const { data: userSession, status } = useSession();\n\n  useEffect(() => {\n    if (!user?.timeZone || status !== \"authenticated\" || userSession?.user?.impersonatedBy) {\n      return;\n    }\n\n    if (\n      dayjs.tz(undefined, CURRENT_TIMEZONE).utcOffset() !== dayjs.tz(undefined, user.timeZone).utcOffset()\n    ) {\n      setShowDialog(true);",
    "endLine": 92,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-93d03e42e2",
    "sourcePath": "apps/web/modules/settings/components/TimezoneChangeDialog.tsx",
    "startLine": 66,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/settings/components/TimezoneChangeDialog.tsx#L66-L92",
    "verifiedSourceHash": "sha256:25bcf84ba0c8bf3000b5cb305c6b595e7fcdcf59cb4e2b719440e3ea24e60ba9"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-ef4a7906a9",
    "code": "          {t(\"dont_update\")}\n        </DialogClose>\n        <DialogClose onClick={() => updateTimezone()} color=\"primary\">\n          {t(\"update_timezone\")}\n        </DialogClose>\n      </DialogFooter>\n    </>\n  );\n};\n\nexport function useOpenTimezoneDialog() {\n  const { data: user } = trpc.viewer.me.get.useQuery();\n  const [showDialog, setShowDialog] = useState(false);\n  const { data: userSession, status } = useSession();\n\n  useEffect(() => {\n    if (!user?.timeZone || status !== \"authenticated\" || userSession?.user?.impersonatedBy) {\n      return;\n    }\n\n    if (\n      dayjs.tz(undefined, CURRENT_TIMEZONE).utcOffset() !== dayjs.tz(undefined, user.timeZone).utcOffset()\n    ) {\n      setShowDialog(true);\n    }\n  }, [user?.timeZone, status, userSession?.user?.impersonatedBy]);\n",
    "endLine": 95,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-ef4a7906a9",
    "sourcePath": "apps/web/modules/settings/components/TimezoneChangeDialog.tsx",
    "startLine": 69,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/settings/components/TimezoneChangeDialog.tsx#L69-L95",
    "verifiedSourceHash": "sha256:21cae4d89724ab6c4920e9086027e6dc518565abb0fd597336339eac4f55a509"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-03751d972b",
    "code": "\n  const newOAuthClientButton = (\n    <NewOAuthClientButton\n      dataTestId=\"open-oauth-client-create-dialog\"\n      onClick={() => setIsCreatingClient(true)}\n    />\n  );\n\n  return (\n    <SettingsHeader\n      title={t(\"oauth_clients\")}\n      description={t(\"oauth_clients_description\")}\n      CTA={newOAuthClientButton}\n      borderInShellHeader={true}>\n      <div>\n        {oAuthClients && oAuthClients.length > 0 ? (\n          <div className=\"border-subtle rounded-b-lg border border-t-0\">\n            <OAuthClientsList\n              clients={oAuthClients.map((client) => ({\n                clientId: client.clientId,\n                name: client.name,\n                purpose: client.purpose,\n                redirectUri: client.redirectUri,\n                websiteUrl: client.websiteUrl,\n                logo: client.logo,\n                status: client.status,\n                rejectionReason: client.rejectionReason,",
    "endLine": 132,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-03751d972b",
    "sourcePath": "apps/web/modules/settings/developer/oauth-clients-view.tsx",
    "startLine": 106,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/settings/developer/oauth-clients-view.tsx#L106-L132",
    "verifiedSourceHash": "sha256:228221e919b208c688937dbd5c9e7e8116e668eb649f21deffbc79d95af3f238"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-adb7e3dd02",
    "code": "          const { role, username } = row.original;\n          return (\n            <Badge\n              data-testid={`member-${username}-role`}\n              variant={role === \"MEMBER\" ? \"gray\" : \"blue\"}\n              onClick={() => {\n                table.getColumn(\"role\")?.setFilterValue([role]);\n              }}>\n              {role}\n            </Badge>\n          );\n        },\n      },\n      {\n        id: \"teams\",\n        accessorFn: (data) =>\n          data.teams.map((team: { id: number; name: string; slug: string | null }) => team.name),\n        header: t(\"teams\"),\n        size: 140,\n        cell: ({ row, table }) => {\n          if (isPending) {\n            return <SkeletonText className=\"h-6 w-1/4\" />;\n          }\n          const { teams, accepted, email, username } = row.original;\n          // TODO: Implement click to filter\n          return (\n            <div className=\"flex h-full flex-wrap items-center gap-2\">",
    "endLine": 187,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-adb7e3dd02",
    "sourcePath": "apps/web/modules/users/components/UserTable/PlatformManagedUsersTable.tsx",
    "startLine": 161,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/users/components/UserTable/PlatformManagedUsersTable.tsx#L161-L187",
    "verifiedSourceHash": "sha256:44292e5ed7da63f5a959efe6184a875bd093c7fd7a0d10b818e4c4d6b10eb4f3"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-1789894afb",
    "code": "          }\n          return (\n            <Badge\n              data-testid={`member-${username}-role`}\n              variant={roleVariant}\n              onClick={() => {\n                table.getColumn(\"role\")?.setFilterValue([role]);\n              }}>\n              {roleName}\n            </Badge>\n          );\n        },\n      },\n      {\n        id: \"teams\",\n        accessorFn: (data: UserTableUser) =>\n          data.teams.map(\n            (team: {\n              id: number;\n              name: string;\n              slug: string | null;\n              logoUrl?: string | null;\n              isOrganization?: boolean;\n            }) => team.name\n          ),\n        header: t(\"teams\"),\n        size: 140,",
    "endLine": 392,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-1789894afb",
    "sourcePath": "apps/web/modules/users/components/UserTable/UserListTable.tsx",
    "startLine": 366,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/users/components/UserTable/UserListTable.tsx#L366-L392",
    "verifiedSourceHash": "sha256:d6b5dcb7f86370e4186f1a13ba74b783b641a98ee1dd43d2cbb9b3e190918b6c"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-5328c2061a",
    "code": "        createPortal(\n          <div className=\"flex items-center gap-2\">\n            <DataTableToolbar.CTA\n              type=\"button\"\n              color=\"secondary\"\n              StartIcon=\"file-down\"\n              loading={isDownloading}\n              onClick={() => handleDownload()}\n              data-testid=\"export-members-button\">\n              {t(\"download\")}\n            </DataTableToolbar.CTA>\n            {(permissions?.canInvite ?? adminOrOwner) && (\n              <DataTableToolbar.CTA\n                type=\"button\"\n                color=\"primary\"\n                StartIcon=\"plus\"\n                onClick={() => {\n                  dispatch({\n                    type: \"INVITE_MEMBER\",\n                    payload: {\n                      showModal: true,\n                    },\n                  });\n                  posthog.capture(\"add_organization_member_clicked\");\n                }}\n                data-testid=\"new-organization-member-button\">\n                {t(\"add\")}",
    "endLine": 778,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-4-1-2-name-role-value-5328c2061a",
    "sourcePath": "apps/web/modules/users/components/UserTable/UserListTable.tsx",
    "startLine": 752,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/users/components/UserTable/UserListTable.tsx#L752-L778",
    "verifiedSourceHash": "sha256:5cf9bc3d9ce0bb1cee642797fce39d3e1852747d455fdda713d52199fe8319b3"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-cfe70c8504",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Ascension%20Island%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Ascension Island\" class=\"CountryFlag\" src=\"./AC.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Ascension Island\">\n\t\t\t\t\tAC\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Andorra%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Andorra\" class=\"CountryFlag\" src=\"./AD.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Andorra\">\n\t\t\t\t\tAD\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=United%20Arab%20Emirates%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"United Arab Emirates\" class=\"CountryFlag\" src=\"./AE.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 74,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-cfe70c8504",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 48,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L48-L74",
    "verifiedSourceHash": "sha256:3478277c575689ba77c21e0107ce18cbecc0e4ad6a19dc2d45f23231c671c378"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-92ec5fc8df",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Andorra%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Andorra\" class=\"CountryFlag\" src=\"./AD.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Andorra\">\n\t\t\t\t\tAD\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=United%20Arab%20Emirates%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"United Arab Emirates\" class=\"CountryFlag\" src=\"./AE.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"United Arab Emirates\">\n\t\t\t\t\tAE\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Afghanistan%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Afghanistan\" class=\"CountryFlag\" src=\"./AF.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 85,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-92ec5fc8df",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 59,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L59-L85",
    "verifiedSourceHash": "sha256:f7bbbfe3b6ac198368846e291006e5fcd498bb6851b5cefef14e6ad2ab2b713b"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-1a11905ba5",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=United%20Arab%20Emirates%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"United Arab Emirates\" class=\"CountryFlag\" src=\"./AE.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"United Arab Emirates\">\n\t\t\t\t\tAE\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Afghanistan%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Afghanistan\" class=\"CountryFlag\" src=\"./AF.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Afghanistan\">\n\t\t\t\t\tAF\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Antigua%20and%20Barbuda%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Antigua and Barbuda\" class=\"CountryFlag\" src=\"./AG.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 96,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-1a11905ba5",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 70,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L70-L96",
    "verifiedSourceHash": "sha256:c08ea8b69fa098bc4caf54b515447ba957f5cb6c651688855742d98c99cd5fa4"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-f5efbb887d",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Afghanistan%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Afghanistan\" class=\"CountryFlag\" src=\"./AF.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Afghanistan\">\n\t\t\t\t\tAF\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Antigua%20and%20Barbuda%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Antigua and Barbuda\" class=\"CountryFlag\" src=\"./AG.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Antigua and Barbuda\">\n\t\t\t\t\tAG\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Anguilla%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Anguilla\" class=\"CountryFlag\" src=\"./AI.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 107,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-f5efbb887d",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 81,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L81-L107",
    "verifiedSourceHash": "sha256:c0cc9081ee50fdf16ede9c389c9567c81b7d6308de5217aac28f66e404c399e5"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-4981e87165",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Antigua%20and%20Barbuda%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Antigua and Barbuda\" class=\"CountryFlag\" src=\"./AG.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Antigua and Barbuda\">\n\t\t\t\t\tAG\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Anguilla%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Anguilla\" class=\"CountryFlag\" src=\"./AI.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Anguilla\">\n\t\t\t\t\tAI\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Albania%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Albania\" class=\"CountryFlag\" src=\"./AL.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 118,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-4981e87165",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 92,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L92-L118",
    "verifiedSourceHash": "sha256:1ec3917ff05cbef9ad56fc0d370c1d74ce7793156cb62d27c8c8707be895ca13"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-2f405151a5",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Anguilla%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Anguilla\" class=\"CountryFlag\" src=\"./AI.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Anguilla\">\n\t\t\t\t\tAI\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Albania%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Albania\" class=\"CountryFlag\" src=\"./AL.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Albania\">\n\t\t\t\t\tAL\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Armenia%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Armenia\" class=\"CountryFlag\" src=\"./AM.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 129,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-2f405151a5",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 103,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L103-L129",
    "verifiedSourceHash": "sha256:7529edc89ee4accec7dac1594934fb0d3c9038143eb6b89943e969869ff5a2a2"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-87c7a161e0",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Albania%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Albania\" class=\"CountryFlag\" src=\"./AL.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Albania\">\n\t\t\t\t\tAL\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Armenia%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Armenia\" class=\"CountryFlag\" src=\"./AM.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Armenia\">\n\t\t\t\t\tAM\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Angola%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Angola\" class=\"CountryFlag\" src=\"./AO.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 140,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-87c7a161e0",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 114,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L114-L140",
    "verifiedSourceHash": "sha256:288a7c16f3adebf8ac90ab9ae11d823ab52a7de4b79752a2da9db547063928f3"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-cd16051bfc",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Armenia%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Armenia\" class=\"CountryFlag\" src=\"./AM.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Armenia\">\n\t\t\t\t\tAM\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Angola%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Angola\" class=\"CountryFlag\" src=\"./AO.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Angola\">\n\t\t\t\t\tAO\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Antarctica%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Antarctica\" class=\"CountryFlag\" src=\"./AQ.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 151,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-cd16051bfc",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 125,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L125-L151",
    "verifiedSourceHash": "sha256:97b300853117e26cfbb10ba832994c7eeab25e2f8e176da854307eb2beea15a8"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-5347e5d6f1",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Angola%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Angola\" class=\"CountryFlag\" src=\"./AO.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Angola\">\n\t\t\t\t\tAO\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Antarctica%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Antarctica\" class=\"CountryFlag\" src=\"./AQ.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Antarctica\">\n\t\t\t\t\tAQ\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Argentina%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Argentina\" class=\"CountryFlag\" src=\"./AR.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 162,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-5347e5d6f1",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 136,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L136-L162",
    "verifiedSourceHash": "sha256:652f5305c4bd52d44557cad03bd71cd70fd80728248685522765271f4aab07c7"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-a49a091245",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Antarctica%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Antarctica\" class=\"CountryFlag\" src=\"./AQ.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Antarctica\">\n\t\t\t\t\tAQ\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Argentina%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Argentina\" class=\"CountryFlag\" src=\"./AR.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Argentina\">\n\t\t\t\t\tAR\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=American%20Samoa%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"American Samoa\" class=\"CountryFlag\" src=\"./AS.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 173,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-a49a091245",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 147,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L147-L173",
    "verifiedSourceHash": "sha256:2bd490b12f21a17c5c037392cc2b8e3fc2efd5d6b43413ca6097408a21c081ec"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-81f59d3986",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Argentina%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Argentina\" class=\"CountryFlag\" src=\"./AR.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Argentina\">\n\t\t\t\t\tAR\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=American%20Samoa%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"American Samoa\" class=\"CountryFlag\" src=\"./AS.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"American Samoa\">\n\t\t\t\t\tAS\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Austria%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Austria\" class=\"CountryFlag\" src=\"./AT.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 184,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-81f59d3986",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 158,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L158-L184",
    "verifiedSourceHash": "sha256:c926033b1072ca5801c5fd802e010d3b2228dc7bfd8442e7dea2a9f80fe603f2"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-579d4ca84c",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=American%20Samoa%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"American Samoa\" class=\"CountryFlag\" src=\"./AS.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"American Samoa\">\n\t\t\t\t\tAS\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Austria%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Austria\" class=\"CountryFlag\" src=\"./AT.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Austria\">\n\t\t\t\t\tAT\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Australia%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Australia\" class=\"CountryFlag\" src=\"./AU.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 195,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-579d4ca84c",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 169,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L169-L195",
    "verifiedSourceHash": "sha256:0580d73c1bb723799c3a124696c3a58633fa0986ecf50acee42d19c949325ec1"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-4adced2a8a",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Austria%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Austria\" class=\"CountryFlag\" src=\"./AT.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Austria\">\n\t\t\t\t\tAT\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Australia%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Australia\" class=\"CountryFlag\" src=\"./AU.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Australia\">\n\t\t\t\t\tAU\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Aruba%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Aruba\" class=\"CountryFlag\" src=\"./AW.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 206,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-4adced2a8a",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 180,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L180-L206",
    "verifiedSourceHash": "sha256:d58da30e7ad6e8773465f4b0887d4b1be22bbcc3d105f837c82409bc837db52e"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-0b56d1bcb2",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Australia%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Australia\" class=\"CountryFlag\" src=\"./AU.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Australia\">\n\t\t\t\t\tAU\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Aruba%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Aruba\" class=\"CountryFlag\" src=\"./AW.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Aruba\">\n\t\t\t\t\tAW\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=%C3%85land%20Islands%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Åland Islands\" class=\"CountryFlag\" src=\"./AX.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 217,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-0b56d1bcb2",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 191,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L191-L217",
    "verifiedSourceHash": "sha256:273165818fe4afbf5a1ed32e994c5b4e2273f431b42eadd417d8e26b5293e7af"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-72637e1891",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Aruba%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Aruba\" class=\"CountryFlag\" src=\"./AW.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Aruba\">\n\t\t\t\t\tAW\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=%C3%85land%20Islands%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Åland Islands\" class=\"CountryFlag\" src=\"./AX.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Åland Islands\">\n\t\t\t\t\tAX\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Azerbaijan%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Azerbaijan\" class=\"CountryFlag\" src=\"./AZ.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 228,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-72637e1891",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 202,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L202-L228",
    "verifiedSourceHash": "sha256:2e9cee1c4ea3206645bda57fbe2d3e1211a4afbca27a80f4500c091f7cfed2ab"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-8c1d836571",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=%C3%85land%20Islands%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Åland Islands\" class=\"CountryFlag\" src=\"./AX.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Åland Islands\">\n\t\t\t\t\tAX\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Azerbaijan%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Azerbaijan\" class=\"CountryFlag\" src=\"./AZ.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Azerbaijan\">\n\t\t\t\t\tAZ\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Bosnia%20and%20Herzegovina%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Bosnia and Herzegovina\" class=\"CountryFlag\" src=\"./BA.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 239,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-8c1d836571",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 213,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L213-L239",
    "verifiedSourceHash": "sha256:371bdac6c4285a23015c89f3146e7fce63f3d85b9c7ebeed5a03f65ac58f88ca"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-8f566ba335",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Azerbaijan%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Azerbaijan\" class=\"CountryFlag\" src=\"./AZ.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Azerbaijan\">\n\t\t\t\t\tAZ\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Bosnia%20and%20Herzegovina%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Bosnia and Herzegovina\" class=\"CountryFlag\" src=\"./BA.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Bosnia and Herzegovina\">\n\t\t\t\t\tBA\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Barbados%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Barbados\" class=\"CountryFlag\" src=\"./BB.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 250,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-8f566ba335",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 224,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L224-L250",
    "verifiedSourceHash": "sha256:a6ed5d9faf1d5422f655f529baa478494c8d5897404fb73cf712060f5f692e92"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-481a283818",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Bosnia%20and%20Herzegovina%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Bosnia and Herzegovina\" class=\"CountryFlag\" src=\"./BA.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Bosnia and Herzegovina\">\n\t\t\t\t\tBA\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Barbados%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Barbados\" class=\"CountryFlag\" src=\"./BB.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Barbados\">\n\t\t\t\t\tBB\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Bangladesh%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Bangladesh\" class=\"CountryFlag\" src=\"./BD.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 261,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-481a283818",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 235,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L235-L261",
    "verifiedSourceHash": "sha256:63740983180c3f50390d634bb78257401f329d3f86e1cae712ea11be2d275c86"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-8a87cdaeb5",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Barbados%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Barbados\" class=\"CountryFlag\" src=\"./BB.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Barbados\">\n\t\t\t\t\tBB\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Bangladesh%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Bangladesh\" class=\"CountryFlag\" src=\"./BD.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Bangladesh\">\n\t\t\t\t\tBD\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Belgium%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Belgium\" class=\"CountryFlag\" src=\"./BE.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 272,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-8a87cdaeb5",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 246,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L246-L272",
    "verifiedSourceHash": "sha256:b9c982bcd89b5130e61f47fddcdba4f7afbf471dad83920422de341076b68609"
  },
  {
    "anchorId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-d70ff79fae",
    "code": "\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Bangladesh%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Bangladesh\" class=\"CountryFlag\" src=\"./BD.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Bangladesh\">\n\t\t\t\t\tBD\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Belgium%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Belgium\" class=\"CountryFlag\" src=\"./BE.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\t\t\t\t<h1 title=\"Belgium\">\n\t\t\t\t\tBE\n\t\t\t\t</h1>\n\t\t\t</section>\n\n\t\t\t<section class=\"Country\">\n\t\t\t\t<div class=\"CountryFlagContainer\">\n\t\t\t\t\t<a href=\"https://www.google.com/search?q=Burkina%20Faso%20flag&tbm=isch\" target=\"_blank\" class=\"CountryFlagLink\">\n\t\t\t\t\t\t<img title=\"Burkina Faso\" class=\"CountryFlag\" src=\"./BF.svg\"/>\n\t\t\t\t\t</a>\n\t\t\t\t</div>",
    "endLine": 283,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "html",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-accessibility-wcag-1-1-1-img-alt-d70ff79fae",
    "sourcePath": "apps/web/public/country-flag-icons/3x2/index.html",
    "startLine": 257,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/public/country-flag-icons/3x2/index.html#L257-L283",
    "verifiedSourceHash": "sha256:e770c56e74708f618cf7c626c6fd736064e44525b3c20b56ad48f8c60e1c9864"
  },
  {
    "anchorId": "source-repository-health-analysis-incomplete",
    "code": "model User {\n  id    Int     @id @default(autoincrement())\n  email String  @unique\n  name  String?\n  calcomUserId Int? @unique\n  calcomUsername String? @unique\n  refreshToken String? @unique\n  accessToken String? @unique\n  createdAt DateTime @default(now())\n  updatedAt DateTime @default(now())\n\n}",
    "endLine": 26,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Source evidence",
      "icuArgs": {},
      "msgid": "scribe.report.repositoryHealth.sourceSnippet.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Source evidence"
        }
      }
    },
    "language": "prisma",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-analysis-incomplete",
    "sourcePath": "packages/platform/examples/base/prisma/schema.prisma",
    "startLine": 15,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/platform/examples/base/prisma/schema.prisma#L15-L26",
    "verifiedSourceHash": "sha256:d4a1dc96a378c2d7de1da8a75f5b2a1361f52e8b10719ff0955c0f70edbba1f7"
  },
  {
    "anchorId": "source-repository-health-complexity-textfilter-b18a3184a6",
    "code": "} from \"./types\";\n\nexport const textFilter = (cellValue: unknown, filterValue: TextFilterValue) => {\n  if (filterValue.data.operator === \"isEmpty\" && !cellValue) {\n    return true;\n  }\n\n  if (typeof cellValue !== \"string\") {\n    return false;\n  }\n\n  switch (filterValue.data.operator) {\n    case \"equals\":\n      return cellValue.toLowerCase() === (filterValue.data.operand || \"\").toLowerCase();\n    case \"notEquals\":\n      return cellValue.toLowerCase() !== (filterValue.data.operand || \"\").toLowerCase();\n    case \"contains\":\n      return cellValue.toLowerCase().includes((filterValue.data.operand || \"\").toLowerCase());\n    case \"notContains\":\n      return !cellValue.toLowerCase().includes((filterValue.data.operand || \"\").toLowerCase());\n    case \"startsWith\":\n      return cellValue.toLowerCase().startsWith((filterValue.data.operand || \"\").toLowerCase());\n    case \"endsWith\":\n      return cellValue.toLowerCase().endsWith((filterValue.data.operand || \"\").toLowerCase());\n    case \"isEmpty\":\n      return cellValue.trim() === \"\";\n    case \"isNotEmpty\":\n      return cellValue.trim() !== \"\";\n    default:\n      return false;\n  }\n};",
    "endLine": 47,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-textfilter-b18a3184a6",
    "sourcePath": "packages/features/data-table/lib/utils.ts",
    "startLine": 16,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/data-table/lib/utils.ts#L16-L47",
    "verifiedSourceHash": "sha256:f520cdf10b7736396fbf0059ba0762736abbe56a74a9a33052deed7fa94312f6"
  },
  {
    "anchorId": "source-repository-health-complexity-deletesubscription-d2b3e5f646",
    "code": "}\n\nexport async function deleteSubscription({\n  appApiKey,\n  webhookId,\n  appId,\n  account,\n}: {\n  appApiKey?: ApiKey;\n  webhookId: string;\n  appId: string;\n  account?: {\n    id: number;\n    name: string | null;\n    isTeam: boolean;\n  } | null;\n}) {\n  const userId = appApiKey ? appApiKey.userId : account && !account.isTeam ? account.id : null;\n  const teamId = appApiKey ? appApiKey.teamId : account && account.isTeam ? account.id : null;\n  try {\n    let where: Prisma.WebhookWhereInput = {};\n    if (teamId) {\n      where = { teamId };\n    } else {\n      where = { userId };\n    }\n\n    const deleteWebhook = await prisma.webhook.delete({\n      where: {\n        ...where,\n        appId: appId,\n        id: webhookId,\n      },\n    });\n\n    if (!deleteWebhook) {\n      throw new Error(`Unable to delete webhook ${webhookId}`);\n    }\n    return deleteWebhook;\n  } catch (err) {\n    const userId = appApiKey ? appApiKey.userId : account && !account.isTeam ? account.id : null;\n    const teamId = appApiKey ? appApiKey.teamId : account && account.isTeam ? account.id : null;\n\n    log.error(\n      `Error deleting subscription for user ${\n        teamId ? `team ${teamId}` : `userId ${userId}`\n      }, webhookId ${webhookId}`,\n      safeStringify(err)\n    );\n  }\n}",
    "endLine": 180,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-deletesubscription-d2b3e5f646",
    "sourcePath": "packages/features/webhooks/lib/scheduleTrigger.ts",
    "startLine": 130,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/webhooks/lib/scheduleTrigger.ts#L130-L180",
    "verifiedSourceHash": "sha256:286ca983909d37e9317414b2cf1e2f78c968df49e17df1939eaf1521b393df25"
  },
  {
    "anchorId": "source-repository-health-complexity-processevents-a2173ba1fe",
    "code": "   */\n  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: event processing requires multiple steps\n  async processEvents(selectedCalendar: SelectedCalendar): Promise<{\n    eventsFetched: number;\n    eventsCached: number;\n    eventsSynced: number;\n    propagationLagMs?: { avg: number; max: number; min: number; count: number };\n  }> {\n    const startTime = performance.now();\n\n    const result: {\n      eventsFetched: number;\n      eventsCached: number;\n      eventsSynced: number;\n      propagationLagMs?: { avg: number; max: number; min: number; count: number };\n    } = {\n      eventsFetched: 0,\n      eventsCached: 0,\n      eventsSynced: 0,\n    };\n\n    const calendarSubscriptionAdapter = this.deps.adapterFactory.get(\n      selectedCalendar.integration as CalendarSubscriptionProvider\n    );\n\n    if (!selectedCalendar.credentialId && !selectedCalendar.delegationCredentialId) {\n      log.debug(\"Selected Calendar doesn't have credentials\", {\n        selectedCalendarId: selectedCalendar.id,\n      });\n      return result;\n    }\n\n    const [cacheEnabled, syncEnabled, cacheEnabledForUser] = await Promise.all([\n      this.isCacheEnabled(),\n      this.isSyncEnabled(),\n      this.isCacheEnabledForUser(selectedCalendar.userId),\n    ]);\n\n    if (!cacheEnabled && !syncEnabled) {\n      log.info(\"Cache and sync are globally disabled\", {\n        channelId: selectedCalendar.channelId,\n      });\n      return result;\n    }\n\n    log.debug(\"Processing events\", { channelId: selectedCalendar.channelId });\n\n    const credential = await this.getCredential(selectedCalendar);\n    if (!credential) {\n      return result;\n    }\n\n    let events: CalendarSubscriptionEvent | null = null;\n    try {\n      events = await calendarSubscriptionAdapter.fetchEvents(selectedCalendar, credential);\n    } catch (err) {\n      metrics.count(\"calendar.subscription.events.fetch.error\", 1, {\n        attributes: { provider: selectedCalendar.integration },\n      });\n      await this.deps.selectedCalendarRepository.updateSyncStatus(selectedCalendar.id, {\n        syncErrorAt: new Date(),\n        syncErrorCount: { increment: 1 },\n      });\n      throw err;\n    }\n\n    if (!events?.items?.length) {\n      log.debug(\"No events fetched\", { channelId: selectedCalendar.channelId });\n      return result;\n    }\n\n    result.eventsFetched = events.items.length;\n\n    metrics.distribution(\"calendar.subscription.events.fetched\", events.items.length, {\n      attributes: {\n        provider: selectedCalendar.integration,\n        incremental: !!selectedCalendar.syncToken,\n      },\n    });\n\n    const now = Date.now();\n    const lagStats = this.calculatePropagationLag(events.items, now);\n    if (lagStats) {\n      result.propagationLagMs = lagStats;\n      metrics.distribution(\"calendar.subscription.propagation_lag.avg_ms\", lagStats.avg, {\n        attributes: { provider: selectedCalendar.integration },\n      });\n      metrics.distribution(\"calendar.subscription.propagation_lag.max_ms\", lagStats.max, {\n        attributes: { provider: selectedCalendar.integration },\n      });\n    }\n\n    await this.deps.selectedCalendarRepository.updateSyncStatus(selectedCalendar.id, {\n      syncToken: events.syncToken || selectedCalendar.syncToken,\n      syncedAt: new Date(),\n      syncErrorAt: null,\n      syncErrorCount: 0,\n    });\n\n    if (cacheEnabled && cacheEnabledForUser) {\n      log.debug(\"Caching events\", { count: events.items.length });\n      await this.deps.calendarCacheEventService.handleEvents(selectedCalendar, events.items);\n      result.eventsCached = events.items.length;\n\n      metrics.distribution(\"calendar.subscription.events.cached\", events.items.length, {\n        attributes: { provider: selectedCalendar.integration },\n      });\n    }\n\n    if (syncEnabled) {\n      log.debug(\"Syncing events\", { count: events.items.length });\n      await this.deps.calendarSyncService.handleEvents(selectedCalendar, events.items);\n      result.eventsSynced = events.items.length;\n\n      metrics.distribution(\"calendar.subscription.events.synced\", events.items.length, {\n        attributes: { provider: selectedCalendar.integration },\n      });\n    }\n\n    metrics.distribution(\"calendar.subscription.processEvents.duration_ms\", performance.now() - startTime, {\n      attributes: {\n        provider: selectedCalendar.integration,\n        cache: cacheEnabled && cacheEnabledForUser ? \"on\" : \"off\",\n        sync: syncEnabled ? \"on\" : \"off\",\n      },\n    });\n\n    return result;\n  }",
    "endLine": 354,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-processevents-a2173ba1fe",
    "sourcePath": "packages/features/calendar-subscription/lib/CalendarSubscriptionService.ts",
    "startLine": 226,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/calendar-subscription/lib/CalendarSubscriptionService.ts#L226-L354",
    "verifiedSourceHash": "sha256:16e684a1d3bd23530c6470c05574ff67957e4f6293c64ac3460811ada50d72eb"
  },
  {
    "anchorId": "source-repository-health-complexity-detectcontenttype-83acfa1fbf",
    "code": " * irrelevant formats like PDF, ICO, TIFF, etc. that aren't used for logos.\n */\nexport async function detectContentType(buffer: Buffer): Promise<string | null> {\n  if ([0xff, 0xd8, 0xff].every((b, i) => buffer[i] === b)) {\n    return JPEG;\n  }\n  if ([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => buffer[i] === b)) {\n    return PNG;\n  }\n  if ([0x47, 0x49, 0x46, 0x38].every((b, i) => buffer[i] === b)) {\n    return GIF;\n  }\n  if ([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50].every((b, i) => !b || buffer[i] === b)) {\n    return WEBP;\n  }\n  if ([0x3c, 0x3f, 0x78, 0x6d, 0x6c].every((b, i) => buffer[i] === b)) {\n    return SVG;\n  }\n  if ([0x3c, 0x73, 0x76, 0x67].every((b, i) => buffer[i] === b)) {\n    return SVG;\n  }\n  if ([0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66].every((b, i) => !b || buffer[i] === b)) {\n    return AVIF;\n  }\n\n  // Fallback to sharp metadata detection\n  try {\n    const meta = await sharp(buffer).metadata();\n    switch (meta?.format) {\n      case \"avif\":\n        return AVIF;\n      case \"webp\":\n        return WEBP;\n      case \"png\":\n        return PNG;\n      case \"jpeg\":\n      case \"jpg\":\n        return JPEG;\n      case \"gif\":\n        return GIF;\n      case \"svg\":\n        return SVG;\n      default:\n        return null;\n    }\n  } catch {\n    return null;\n  }\n}",
    "endLine": 92,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-detectcontenttype-83acfa1fbf",
    "sourcePath": "packages/lib/server/imageUtils.ts",
    "startLine": 44,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/lib/server/imageUtils.ts#L44-L92",
    "verifiedSourceHash": "sha256:d9e7b2bae4303917ebfd86be129e5e523ddb8ceeff90a29a6275801f8e715791"
  },
  {
    "anchorId": "source-repository-health-complexity-reschedulebooking-c07f7f1811",
    "code": "  }\n\n  async rescheduleBooking(\n    request: Request,\n    bookingUid: string,\n    body: RescheduleBookingInput,\n    authUser: AuthOptionalUser\n  ) {\n    try {\n      const isIndividualSeatRequest = this.isRescheduleSeatedBody(body);\n      const isIndividualSeatReschedule = await this.shouldRescheduleIndividualSeat(\n        bookingUid,\n        isIndividualSeatRequest,\n        authUser\n      );\n\n      const bookingRequest = await this.inputService.createRescheduleBookingRequest(\n        request,\n        bookingUid,\n        body,\n        isIndividualSeatReschedule\n      );\n\n      await this.canRescheduleBooking(bookingUid);\n\n      const booking = await this.regularBookingService.createBooking({\n        bookingData: bookingRequest.body,\n        bookingMeta: {\n          userId: bookingRequest.userId ?? authUser?.id,\n          hostname: bookingRequest.headers?.host || \"\",\n          platformClientId: bookingRequest.platformClientId,\n          platformRescheduleUrl: bookingRequest.platformRescheduleUrl,\n          platformCancelUrl: bookingRequest.platformCancelUrl,\n          platformBookingUrl: bookingRequest.platformBookingUrl,\n          platformBookingLocation: bookingRequest.platformBookingLocation,\n          areCalendarEventsEnabled: bookingRequest.areCalendarEventsEnabled,\n        },\n      });\n      if (!booking.uid) {\n        throw new Error(\"Booking missing uid\");\n      }\n\n      const databaseBooking =\n        await this.bookingsRepository.getByUidWithAttendeesWithBookingSeatAndUserAndEvent(booking.uid);\n      if (!databaseBooking) {\n        throw new Error(`Booking with uid=${booking.uid} was not found in the database`);\n      }\n\n      const userIsEventTypeAdminOrOwner =\n        authUser && databaseBooking.eventType\n          ? await this.eventTypeAccessService.userIsEventTypeAdminOrOwner(authUser, databaseBooking.eventType)\n          : false;\n      const isRecurring = !!databaseBooking.recurringEventId;\n      const isSeated = !!databaseBooking.eventType?.seatsPerTimeSlot;\n      const isPlatformManagedUserBooking = !!(booking.userId && booking.user?.isPlatformManaged);\n\n      if (isRecurring && !isSeated) {\n        const outputBooking = await this.outputService.getOutputRecurringBooking(databaseBooking);\n        return Object.assign(outputBooking, { isPlatformManagedUserBooking });\n      }\n      if (isRecurring && isSeated) {\n        const outputBooking = await this.outputService.getOutputCreateRecurringSeatedBooking(\n          databaseBooking,\n          booking?.seatReferenceUid || \"\",\n          userIsEventTypeAdminOrOwner\n        );\n        return Object.assign(outputBooking, { isPlatformManagedUserBooking });\n      }\n      if (isSeated) {\n        const outputBooking = await this.outputService.getOutputCreateSeatedBooking(\n          databaseBooking,\n          booking.seatReferenceUid || \"\",\n          userIsEventTypeAdminOrOwner\n        );\n        return Object.assign(outputBooking, { isPlatformManagedUserBooking });\n      }\n      const outputBooking = await this.outputService.getOutputBooking(databaseBooking);\n      return Object.assign(outputBooking, { isPlatformManagedUserBooking });\n    } catch (error) {\n      this.errorsBookingsService.handleBookingError(error, false);\n    }\n  }",
    "endLine": 822,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-reschedulebooking-c07f7f1811",
    "sourcePath": "apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts",
    "startLine": 741,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts#L741-L822",
    "verifiedSourceHash": "sha256:a0d598ec5699dba2e59eede15bfa84d22e813f67d7d93fb66170993b7ef059a9"
  },
  {
    "anchorId": "source-repository-health-complexity-handleroundrobinrescheduled-22798f212e",
    "code": "   * Handles notifications for a RESCHEDULED RR booking.\n   */\n  private async _handleRoundRobinRescheduled(data: RescheduleEmailAndSmsPayload) {\n    const {\n      evt,\n      eventType: { metadata },\n      originalRescheduledBooking,\n      rescheduleReason,\n      additionalNotes,\n      changedOrganizer,\n      additionalInformation,\n      users,\n      isRescheduledByBooker,\n      iCalUID,\n    } = data;\n    const copyEvent = cloneDeep(evt);\n    const copyEventAdditionalInfo = {\n      ...copyEvent,\n      additionalInformation,\n      additionalNotes,\n      cancellationReason: `$RCH$${rescheduleReason || \"\"}`,\n    };\n    const cancelledRRHostEvt = cloneDeep(copyEventAdditionalInfo);\n    this.log.debug(\"Emails: Sending rescheduled emails for booking confirmation\");\n\n    const originalBookingMemberEmails: Person[] = [];\n\n    for (const user of originalRescheduledBooking.attendees) {\n      const translate = await getTranslation(user.locale ?? \"en\", \"common\");\n      originalBookingMemberEmails.push({\n        name: user.name,\n        email: user.email,\n        timeZone: user.timeZone,\n        phoneNumber: user.phoneNumber,\n        language: { translate, locale: user.locale ?? \"en\" },\n      });\n    }\n    if (originalRescheduledBooking.user) {\n      const translate = await getTranslation(originalRescheduledBooking.user.locale ?? \"en\", \"common\");\n      const originalOrganizer = originalRescheduledBooking.user;\n\n      originalBookingMemberEmails.push({\n        ...originalRescheduledBooking.user,\n        username: originalRescheduledBooking.user.username ?? undefined,\n        timeFormat: getTimeFormatStringFromUserTimeFormat(originalRescheduledBooking.user.timeFormat),\n        name: originalRescheduledBooking.user.name || \"\",\n        language: { translate, locale: originalRescheduledBooking.user.locale ?? \"en\" },\n      });\n\n      if (changedOrganizer) {\n        cancelledRRHostEvt.title = originalRescheduledBooking.title;\n        cancelledRRHostEvt.startTime =\n          dayjs(originalRescheduledBooking?.startTime).utc().format() || copyEventAdditionalInfo.startTime;\n        cancelledRRHostEvt.endTime =\n          dayjs(originalRescheduledBooking?.endTime).utc().format() || copyEventAdditionalInfo.endTime;\n        cancelledRRHostEvt.organizer = {\n          email: originalOrganizer.email,\n          name: originalOrganizer.name || \"\",\n          timeZone: originalOrganizer.timeZone,\n          language: { translate, locale: originalOrganizer.locale || \"en\" },\n        };\n      }\n    }\n\n    const newBookingMemberEmails: Person[] = [\n      ...(copyEvent.team?.members || []),\n      copyEvent.organizer,\n      ...copyEvent.attendees,\n    ];\n\n    const matchOriginalMemberWithNewMember = (originalMember: Person, newMember: Person) =>\n      originalMember.email === newMember.email;\n\n    const newBookedMembers = newBookingMemberEmails.filter(\n      (member) => !originalBookingMemberEmails.some((om) => matchOriginalMemberWithNewMember(om, member))\n    );\n    const cancelledMembers = originalBookingMemberEmails.filter(\n      (member) => !newBookingMemberEmails.some((nm) => matchOriginalMemberWithNewMember(member, nm))\n    );\n    const rescheduledMembers = newBookingMemberEmails.filter((member) =>\n      originalBookingMemberEmails.some((om) => matchOriginalMemberWithNewMember(om, member))\n    );\n\n    const reassignedTo = users.find(\n      (user) => !user.isFixed && newBookedMembers.some((member) => member.email === user.email)\n    );\n\n    const {\n      sendRoundRobinRescheduledEmailsAndSMS,\n      sendReassignedScheduledEmailsAndSMS,\n      sendRoundRobinCancelledEmailsAndSMS,\n    } = await import(\"@calcom/emails/email-manager\");\n\n    try {\n      await Promise.all([\n        sendRoundRobinRescheduledEmailsAndSMS(\n          { ...copyEventAdditionalInfo, iCalUID },\n          rescheduledMembers,\n          metadata\n        ),\n        sendReassignedScheduledEmailsAndSMS({\n          calEvent: copyEventAdditionalInfo,\n          members: newBookedMembers,\n          eventTypeMetadata: metadata,\n        }),\n        sendRoundRobinCancelledEmailsAndSMS(\n          cancelledRRHostEvt,\n          cancelledMembers,\n          metadata,\n          reassignedTo\n            ? {\n                name: reassignedTo.name,\n                email: reassignedTo.email,\n                ...(isRescheduledByBooker && { reason: \"Booker Rescheduled\" }),\n              }\n            : undefined\n        ),\n      ]);\n    } catch (err) {\n      this.log.error(\"Failed to send rescheduled round robin event related emails\", err);\n    }\n  }",
    "endLine": 254,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-handleroundrobinrescheduled-22798f212e",
    "sourcePath": "packages/features/bookings/lib/BookingEmailSmsHandler.ts",
    "startLine": 133,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/bookings/lib/BookingEmailSmsHandler.ts#L133-L254",
    "verifiedSourceHash": "sha256:175c4f0816caad37b61591322495a495595da9f79b50d1c733805341a9482f80"
  },
  {
    "anchorId": "source-repository-health-complexity-getandupdatenormalizedvalues-fac5c01648",
    "code": " * Ensures that `labels` and `placeholders`, wherever they are, are set properly. If direct values are not set, default values from fieldTypeConfig are used.\n */\nfunction getAndUpdateNormalizedValues(field: RhfFormFields[number], t: TFunction) {\n  let noLabel = false;\n  let hidden = !!field.hidden;\n  if (field.type === \"radioInput\") {\n    const options = field.options;\n\n    // If we have only one option and it has an input, we don't show the field label because Option name acts as label.\n    // e.g. If it's just Attendee Phone Number option then we don't show `Location` label\n    if (options?.length === 1) {\n      if (!field.optionsInputs) {\n        throw new Error(\"radioInput must have optionsInputs\");\n      }\n      if (field.optionsInputs[options[0].value]) {\n        // We don't show the label in this case because the optionInput itself will decide what label to show\n        noLabel = true;\n      } else {\n        // If there's only one option and it doesn't have an input, we don't show the field at all because it's visible in the left side bar\n        hidden = true;\n      }\n    }\n  }\n\n  /**\n   * Instead of passing labelAsSafeHtml props to all the components, FormBuilder components can assume that the label is safe html and use it on a case by case basis after adding checks here\n   */\n  if (fieldsThatSupportLabelAsSafeHtml.includes(field.type) && field.labelAsSafeHtml === undefined) {\n    throw new Error(`${field.name}:${field.type} type must have labelAsSafeHtml set`);\n  }\n\n  const translatedDefaultLabel = t(field.defaultLabel || \"\");\n  const label = field.labelAsSafeHtml || field.label || translatedDefaultLabel;\n  const placeholder = field.placeholder || t(field.defaultPlaceholder || \"\");\n\n  if (field.variantsConfig?.variants) {\n    Object.entries(field.variantsConfig.variants).forEach(([variantName, variant]) => {\n      variant.fields.forEach((variantField) => {\n        const fieldTypeVariantsConfig = fieldTypesConfigMap[field.type]?.variantsConfig;\n        const defaultVariantFieldLabel =\n          fieldTypeVariantsConfig?.variants?.[variantName]?.fieldsMap[variantField.name]?.defaultLabel;\n\n        variantField.label = variantField.label || t(defaultVariantFieldLabel || \"\");\n      });\n    });\n  }\n\n  return { hidden, placeholder, label, noLabel, translatedDefaultLabel };\n}",
    "endLine": 240,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-getandupdatenormalizedvalues-fac5c01648",
    "sourcePath": "apps/web/modules/form-builder/components/FormBuilderField.tsx",
    "startLine": 192,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/web/modules/form-builder/components/FormBuilderField.tsx#L192-L240",
    "verifiedSourceHash": "sha256:39ce8a1cbb989efe87538d4c04b8c0bb873832e1f75e4a26cfbd91ff4fafeb52"
  },
  {
    "anchorId": "source-repository-health-complexity-createifnotexistsguestactor-8329450e79",
    "code": "  }\n\n  async createIfNotExistsGuestActor(params: {\n    email: string | null;\n    name: string | null;\n    phone: string | null;\n  }) {\n    const { email, name, phone } = params;\n    const normalizedEmail = email && email.trim() !== \"\" ? email : null;\n    const normalizedName = name && name.trim() !== \"\" ? name : null;\n    const normalizedPhone = phone && phone.trim() !== \"\" ? phone : null;\n\n    // If all fields are null, we can't use upsert (no unique constraint), so just create a new record\n    if (!normalizedEmail && !normalizedPhone) {\n      return this.deps.prismaClient.auditActor.create({\n        data: {\n          type: \"GUEST\",\n          email: null,\n          name: normalizedName,\n          phone: null,\n        },\n      });\n    }\n\n    // First try to find by email if email exists\n    if (normalizedEmail) {\n      const existingByEmail = await this.deps.prismaClient.auditActor.findUnique({\n        where: { email: normalizedEmail },\n        select: { id: true },\n      });\n\n      if (existingByEmail) {\n        // Update existing record found by email\n        return this.deps.prismaClient.auditActor.update({\n          where: { email: normalizedEmail },\n          data: {\n            name: normalizedName ?? undefined,\n            phone: normalizedPhone ?? undefined,\n          },\n        });\n      }\n    }\n\n    // If not found by email and phone exists, try to find by phone\n    if (normalizedPhone) {\n      const existingByPhone = await this.deps.prismaClient.auditActor.findUnique({\n        where: { phone: normalizedPhone },\n        select: { id: true },\n      });\n\n      if (existingByPhone) {\n        // Update existing record found by phone\n        return this.deps.prismaClient.auditActor.update({\n          where: { phone: normalizedPhone },\n          data: {\n            email: normalizedEmail ?? undefined,\n            name: normalizedName ?? undefined,\n          },\n        });\n      }\n    }\n\n    // Not found by either email or phone, create new record\n    return this.deps.prismaClient.auditActor.create({\n      data: {\n        type: \"GUEST\",\n        email: normalizedEmail,\n        name: normalizedName,\n        phone: normalizedPhone,\n      },\n    });\n  }",
    "endLine": 95,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-createifnotexistsguestactor-8329450e79",
    "sourcePath": "packages/features/booking-audit/lib/repository/PrismaAuditActorRepository.ts",
    "startLine": 24,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/booking-audit/lib/repository/PrismaAuditActorRepository.ts#L24-L95",
    "verifiedSourceHash": "sha256:8a6d70c55f71eeeb8c4f0050e3a182bfacdeb782cc8c36f889061143df3b8c48"
  },
  {
    "anchorId": "source-repository-health-complexity-save-8f4b6f6e52",
    "code": "   * are enforced via controller route guards, avoiding duplication of this logic within the service layer.\n   */\n  async save(\n    @Query(\"state\") state: string,\n    @Query(\"code\") code: string,\n    @Query(\"error\") error: string | undefined,\n    @Query(\"error_description\") error_description: string | undefined\n  ): Promise<StripCredentialsSaveOutputResponseDto> {\n    if (!state) {\n      throw new BadRequestException(\"Missing `state` query param\");\n    }\n\n    const decodedCallbackState: OAuthCallbackState = JSON.parse(state);\n    try {\n      // If teamId is present, proxy to team endpoint\n      if (decodedCallbackState.teamId && decodedCallbackState.orgId) {\n        let url = \"\";\n        const apiUrl = this.config.get(\"api.url\");\n        url = `${apiUrl}/organizations/${decodedCallbackState.orgId}/teams/${decodedCallbackState.teamId}/stripe/save`;\n\n        const params: Record<string, string | undefined> = { state, code, error, error_description };\n        const headers = {\n          Authorization: `Bearer ${decodedCallbackState.accessToken}`,\n        };\n        try {\n          const response = await this.httpService.axiosRef.get(url, { params, headers });\n          const redirectUrl = response.data?.url || decodedCallbackState.onErrorReturnTo || \"\";\n          return { url: redirectUrl };\n        } catch (err) {\n          const fallbackUrl = decodedCallbackState.onErrorReturnTo || \"\";\n          return { url: fallbackUrl };\n        }\n      }\n\n      // user-level fallback\n      const userId = await this.tokensRepository.getAccessTokenOwnerId(decodedCallbackState.accessToken);\n\n      // user cancels flow\n      if (error === \"access_denied\") {\n        return { url: getOnErrorReturnToValueFromQueryState(state) };\n      }\n\n      if (error) {\n        throw new BadRequestException(stringify({ error, error_description }));\n      }\n\n      if (!userId) {\n        throw new BadRequestException(\"Invalid Access token.\");\n      }\n\n      return await this.stripeService.saveStripeAccount(decodedCallbackState, code, userId);\n    } catch (error) {\n      if (error instanceof Error) {\n        console.error(error.message);\n      }\n      return {\n        url: decodedCallbackState.onErrorReturnTo ?? \"\",\n      };\n    }\n  }",
    "endLine": 148,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-save-8f4b6f6e52",
    "sourcePath": "apps/api/v2/src/modules/stripe/controllers/stripe.controller.ts",
    "startLine": 89,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/api/v2/src/modules/stripe/controllers/stripe.controller.ts#L89-L148",
    "verifiedSourceHash": "sha256:43f391b90c464c80ee206fc585fb755f18f366fbf4218c18854419b32899a2d3"
  },
  {
    "anchorId": "source-repository-health-complexity-getbooking-fd763cf2c0",
    "code": "  });\n}\nexport async function getBooking(bookingId: number) {\n  const booking = await prisma.booking.findUnique({\n    where: {\n      id: bookingId,\n    },\n    select: {\n      ...bookingMinimalSelect,\n      responses: true,\n      eventType: {\n        select: {\n          owner: {\n            select: {\n              hideBranding: true,\n            },\n          },\n          currency: true,\n          description: true,\n          hosts: {\n            select: {\n              user: {\n                select: {\n                  email: true,\n                  destinationCalendar: {\n                    select: {\n                      primaryEmail: true,\n                    },\n                  },\n                },\n              },\n            },\n          },\n          id: true,\n          length: true,\n          price: true,\n          requiresConfirmation: true,\n          hideOrganizerEmail: true,\n          metadata: true,\n          customReplyToEmail: true,\n          title: true,\n          teamId: true,\n          parentId: true,\n          parent: {\n            select: {\n              teamId: true,\n            },\n          },\n          slug: true,\n          schedulingType: true,\n          bookingFields: true,\n          team: {\n            select: {\n              id: true,\n              name: true,\n              parentId: true,\n              hideBranding: true,\n              parent: { select: { hideBranding: true } },\n            },\n          },\n          seatsPerTimeSlot: true,\n          seatsShowAttendees: true,\n          disableCancelling: true,\n          disableRescheduling: true,\n        },\n      },\n      metadata: true,\n      smsReminderNumber: true,\n      location: true,\n      eventTypeId: true,\n      userId: true,\n      uid: true,\n      paid: true,\n      destinationCalendar: true,\n      status: true,\n      user: {\n        select: {\n          id: true,\n          username: true,\n          timeZone: true,\n          credentials: { select: credentialForCalendarServiceSelect },\n          timeFormat: true,\n          email: true,\n          name: true,\n          locale: true,\n          destinationCalendar: true,\n          isPlatformManaged: true,\n          hideBranding: true,\n          profiles: {\n            select: {\n              organization: { select: { hideBranding: true } },\n            },\n          },\n        },\n      },\n    },\n  });\n\n  if (!booking) throw new HttpCode({ statusCode: 204, message: \"No booking found\" });\n\n  type EventTypeRaw = Awaited<ReturnType<typeof getEventType>>;\n  let eventTypeRaw: EventTypeRaw | null = null;\n  if (booking.eventTypeId) {\n    eventTypeRaw = await getEventType(booking.eventTypeId);\n  }\n\n  const eventType = { ...eventTypeRaw, metadata: EventTypeMetaDataSchema.parse(eventTypeRaw?.metadata) };\n\n  const { user: userWithoutDelegationCredentials } = booking;\n\n  if (!userWithoutDelegationCredentials) throw new HttpCode({ statusCode: 204, message: \"No user found\" });\n  const user = await enrichUserWithDelegationCredentials({\n    user: userWithoutDelegationCredentials,\n  });\n\n  const t = await getTranslation(user.locale ?? \"en\", \"common\");\n  const attendeesListPromises = booking.attendees.map(async (attendee) => {\n    return {\n      name: attendee.name,\n      email: attendee.email,\n      timeZone: attendee.timeZone,\n      language: {\n        translate: await getTranslation(attendee.locale ?? \"en\", \"common\"),\n        locale: attendee.locale ?? \"en\",\n      },\n    };\n  });\n\n  const organizerOrganizationProfile = await prisma.profile.findFirst({\n    where: {\n      userId: booking.userId ?? undefined,\n    },\n  });\n\n  const organizerOrganizationId = organizerOrganizationProfile?.organizationId;\n\n  const bookerUrl = await getBookerBaseUrl(\n    booking.eventType?.team?.parentId ?? organizerOrganizationId ?? null\n  );\n\n  const attendeesList = await Promise.all(attendeesListPromises);\n  const selectedDestinationCalendar = booking.destinationCalendar || user.destinationCalendar;\n  const evt: CalendarEvent = {\n    type: booking?.eventType?.slug as string,\n    title: booking.title,\n    bookerUrl,\n    description: booking.description || undefined,\n    startTime: booking.startTime.toISOString(),\n    endTime: booking.endTime.toISOString(),\n    customInputs: isPrismaObjOrUndefined(booking.customInputs),\n    ...getCalEventResponses({\n      booking: booking,\n      bookingFields: booking.eventType?.bookingFields || null,\n    }),\n    organizer: {\n      email: booking?.userPrimaryEmail ?? user.email,\n      name: user.name!,\n      username: user.username || undefined,\n      usernameInOrg: organizerOrganizationProfile?.username || undefined,\n      timeZone: user.timeZone,\n      timeFormat: getTimeFormatStringFromUserTimeFormat(user.timeFormat),\n      language: { translate: t, locale: user.locale ?? \"en\" },\n      id: user.id,\n    },\n    hideOrganizerEmail: booking.eventType?.hideOrganizerEmail,\n    team: booking.eventType?.team\n      ? {\n          name: booking.eventType.team.name,\n          id: booking.eventType.team.id,\n          members: [],\n        }\n      : undefined,\n    attendees: attendeesList,\n    location: booking.location,\n    uid: booking.uid,\n    destinationCalendar: selectedDestinationCalendar ? [selectedDestinationCalendar] : [],\n    recurringEvent: parseRecurringEvent(eventType?.recurringEvent),\n    customReplyToEmail: booking.eventType?.customReplyToEmail,\n    seatsPerTimeSlot: booking.eventType?.seatsPerTimeSlot,\n    seatsShowAttendees: booking.eventType?.seatsShowAttendees,\n    hideBranding: booking.eventTypeId\n      ? await getEventTypeService().shouldHideBrandingForEventType(booking.eventTypeId, {\n          team: booking.eventType?.team\n            ? { hideBranding: booking.eventType.team.hideBranding, parent: booking.eventType.team.parent }\n            : null,\n          owner: {\n            id: user.id,\n            hideBranding: userWithoutDelegationCredentials.hideBranding,\n            profiles: userWithoutDelegationCredentials.profiles ?? [],\n          },\n        } satisfies EventTypeBrandingData)\n      : false,\n    disableCancelling: booking.eventType?.disableCancelling ?? false,\n    disableRescheduling: booking.eventType?.disableRescheduling ?? false,\n  };\n\n  return {\n    booking,\n    user,\n    evt,\n    eventType,\n  };\n}",
    "endLine": 234,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-getbooking-fd763cf2c0",
    "sourcePath": "packages/features/bookings/lib/payment/getBooking.ts",
    "startLine": 32,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/bookings/lib/payment/getBooking.ts#L32-L234",
    "verifiedSourceHash": "sha256:34cfb6e7886ef93274df3589263501dd1d1675e993031ea9da0b4ac296323652"
  },
  {
    "anchorId": "source-repository-health-complexity-getcalendar-38f85f1def",
    "code": "const log = logger.getSubLogger({ prefix: [\"CalendarManager\"] });\n\nexport const getCalendar = async (\n  credential: CredentialForCalendarService | null,\n  mode: CalendarFetchMode = \"none\"\n): Promise<Calendar | null> => {\n  if (!credential || !credential.key) return null;\n  let { type: calendarType } = credential;\n  if (calendarType?.endsWith(\"_other_calendar\")) {\n    calendarType = calendarType.split(\"_other_calendar\")[0];\n  }\n  // Backwards compatibility until CRM manager is created\n  if (calendarType?.endsWith(\"_crm\")) {\n    calendarType = calendarType.split(\"_crm\")[0];\n  }\n\n  const calendarAppImportFn =\n    CalendarServiceMap[calendarType.split(\"_\").join(\"\") as keyof typeof CalendarServiceMap];\n\n  if (!calendarAppImportFn) {\n    log.warn(`calendar of type ${calendarType} is not implemented`);\n    return null;\n  }\n\n  const calendarApp = await calendarAppImportFn;\n\n  const createCalendarService = calendarApp.default;\n\n  if (!createCalendarService || typeof createCalendarService !== \"function\") {\n    log.warn(`calendar of type ${calendarType} is not implemented`);\n    return null;\n  }\n\n  // Determine if we should use cache based on mode:\n  // - \"slots\": Check feature flags and use cache when available (for getting actual calendar availability)\n  // - \"overlay\": Don't use cache (for overlay calendar availability)\n  // - \"booking\": Don't use cache (for booking confirmation)\n  // - \"none\": Don't use cache (for operations that don't use getAvailability, e.g., deleteEvent, listCalendars)\n  let shouldServeCache = false;\n  if (mode === \"slots\") {\n    const featuresRepository = new FeaturesRepository(prisma);\n    const [isCalendarSubscriptionCacheEnabled, isCalendarSubscriptionCacheEnabledForUser] = await Promise.all(\n      [\n        featuresRepository.checkIfFeatureIsEnabledGlobally(\n          CalendarSubscriptionService.CALENDAR_SUBSCRIPTION_CACHE_FEATURE\n        ),\n        featuresRepository.checkIfUserHasFeatureNonHierarchical(\n          credential.userId as number,\n          CalendarSubscriptionService.CALENDAR_SUBSCRIPTION_CACHE_FEATURE\n        ),\n      ]\n    );\n    shouldServeCache = isCalendarSubscriptionCacheEnabled && isCalendarSubscriptionCacheEnabledForUser;\n    log.debug(\"Cache feature flag check\", {\n      credentialId: credential.id,\n      userId: credential.userId,\n      mode,\n      isCalendarSubscriptionCacheEnabled,\n      isCalendarSubscriptionCacheEnabledForUser,\n      shouldServeCache,\n    });\n  } else {\n    log.debug(\"Cache disabled for mode\", {\n      credentialId: credential.id,\n      userId: credential.userId,\n      mode,\n    });\n  }\n\n  const isCacheSupported = CalendarCacheEventService.isCalendarTypeSupported(calendarType);\n\n  // eslint-disable-next-line @typescript-eslint/no-explicit-any\n  const originalCalendar = createCalendarService(credential as any);\n\n  // Determine if we should use cache\n  const useCache = isCacheSupported && shouldServeCache;\n\n  // Build the calendar chain: original -> cache (if enabled) -> telemetry (if enabled)\n  let calendar: Calendar = originalCalendar;\n\n  if (useCache) {\n    log.debug(`Calendar Cache is enabled, using CalendarCacheWrapper for credential ${credential.id}`);\n    const calendarCacheEventRepository = new CalendarCacheEventRepository(prisma);\n    calendar = new CalendarCacheWrapper({\n      originalCalendar: calendar,\n      calendarCacheEventRepository,\n    });\n  }\n\n  // Wrap ALL calendars with telemetry when telemetry is enabled\n  // This provides consistent metrics for all calendar types\n  if (isTelemetryEnabled()) {\n    log.debug(\n      `Using CalendarTelemetryWrapper for credential ${credential.id} (cacheSupported: ${isCacheSupported}, cacheEnabled: ${useCache})`\n    );\n    calendar = new CalendarTelemetryWrapper({\n      originalCalendar: calendar,\n      calendarType,\n      cacheSupported: isCacheSupported,\n      cacheEnabled: useCache,\n      credentialId: credential.id,\n      mode,\n    });\n  }\n\n  return calendar;\n};",
    "endLine": 121,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-getcalendar-38f85f1def",
    "sourcePath": "packages/app-store/_utils/getCalendar.ts",
    "startLine": 15,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/app-store/_utils/getCalendar.ts#L15-L121",
    "verifiedSourceHash": "sha256:6eb3cfbfd771ba217787cd30ef0718d2516fe7c34c958b58b373fd7abcf09053"
  },
  {
    "anchorId": "source-repository-health-complexity-validatereschedulerestrictions-4c1fc46837",
    "code": "}\n\nasync function validateRescheduleRestrictions({\n  rescheduleUid,\n  userId,\n  eventType,\n}: {\n  rescheduleUid: string | null | undefined;\n  userId: number | null;\n  eventType: { seatsPerTimeSlot: number | null; minimumRescheduleNotice: number | null } | null;\n}): Promise<void> {\n  if (!rescheduleUid || !eventType) {\n    return; // Not a reschedule, skip validation\n  }\n\n  const bookingSeat = rescheduleUid ? await getSeatedBooking(rescheduleUid) : null;\n  const actualRescheduleUid = bookingSeat ? bookingSeat.booking.uid : rescheduleUid;\n\n  if (!actualRescheduleUid) {\n    return; // No valid reschedule UID\n  }\n\n  try {\n    const originalRescheduledBooking = await getOriginalRescheduledBooking(\n      actualRescheduleUid,\n      !!eventType.seatsPerTimeSlot\n    );\n\n    // Check if user is the organizer\n    const isUserOrganizer =\n      userId && originalRescheduledBooking.userId && userId === originalRescheduledBooking.userId;\n\n    // Check minimum reschedule notice (only for non-organizers)\n    const { minimumRescheduleNotice } = originalRescheduledBooking.eventType || {};\n    if (\n      !isUserOrganizer &&\n      isWithinMinimumRescheduleNotice(originalRescheduledBooking.startTime, minimumRescheduleNotice ?? null)\n    ) {\n      throw new HttpError({\n        statusCode: 403,\n        message: \"Rescheduling is not allowed within the minimum notice period before the event\",\n      });\n    }\n  } catch (error) {\n    // Re-throw HttpError (including our 403 validation error)\n    if (error instanceof HttpError) {\n      throw error;\n    }\n    // For other errors (like booking not found), let the service handle it later\n    // We don't want to fail early validation for these cases\n  }\n}",
    "endLine": 484,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-validatereschedulerestrictions-4c1fc46837",
    "sourcePath": "packages/features/bookings/lib/service/RegularBookingService.ts",
    "startLine": 433,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/features/bookings/lib/service/RegularBookingService.ts#L433-L484",
    "verifiedSourceHash": "sha256:96e63226e0f7013b0736f3382d933cdd1b2571710e90d2aa53e152e523d56d4f"
  },
  {
    "anchorId": "source-repository-health-complexity-createbooking-29c643e1fa",
    "code": "  ) {}\n\n  async createBooking(request: Request, body: CreateBookingInput, authUser: AuthOptionalUser) {\n    let bookingTeamEventType = false;\n    try {\n      const eventType = await this.getBookedEventType(body);\n      if (eventType?.team) {\n        bookingTeamEventType = true;\n      }\n      if (!eventType) {\n        this.errorsBookingsService.handleEventTypeToBeBookedNotFound(body);\n      }\n      const userIsEventTypeAdminOrOwner = authUser\n        ? await this.eventTypeAccessService.userIsEventTypeAdminOrOwner(authUser, eventType)\n        : false;\n      await this.checkBookingRequiresAuthenticationSetting(eventType, authUser, userIsEventTypeAdminOrOwner);\n\n      if (eventType.schedulingType === \"MANAGED\") {\n        throw new BadRequestException(\n          `Event type with id=${eventType.id} is the parent managed event type that can't be booked. You have to provide the child event type id aka id of event type that has been assigned to one of the users.`\n        );\n      }\n\n      if (eventType.schedulingType === \"COLLECTIVE\" || eventType.schedulingType === \"ROUND_ROBIN\") {\n        await this.checkEventTypeHasHosts(eventType.id);\n      }\n\n      body.eventTypeId = eventType.id;\n\n      const isRecurring = !!eventType?.recurringEvent;\n      const isSeated = !!eventType?.seatsPerTimeSlot;\n\n      await this.hasRequiredBookingFieldsResponses(body, eventType);\n\n      if (isRecurring && isSeated) {\n        return await this.createRecurringSeatedBooking(request, body, eventType, userIsEventTypeAdminOrOwner);\n      }\n      if (isRecurring && !isSeated) {\n        return await this.createRecurringBooking(request, body, eventType);\n      }\n      if (isSeated) {\n        return await this.createSeatedBooking(request, body, eventType, userIsEventTypeAdminOrOwner);\n      }\n\n      return await this.createRegularBooking(request, body, eventType);\n    } catch (error) {\n      this.errorsBookingsService.handleBookingError(error, bookingTeamEventType);\n    }\n  }",
    "endLine": 158,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-createbooking-29c643e1fa",
    "sourcePath": "apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts",
    "startLine": 110,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts#L110-L158",
    "verifiedSourceHash": "sha256:bd8a62aeb324875a4ff0647f8a09490a217e16f07872b1bbebeb7b16f7b01dbf"
  },
  {
    "anchorId": "source-repository-health-complexity-handleeventtypetobebookednotfound-cc55780172",
    "code": "  private readonly logger = new Logger(\"ErrorsBookingsService_2024_08_13\");\n\n  handleEventTypeToBeBookedNotFound(body: CreateBookingInput): never {\n    if (body.username && body.eventTypeSlug && !body.organizationSlug) {\n      throw new NotFoundException(\n        `Event type with slug ${body.eventTypeSlug} belonging to user ${body.username} not found.`\n      );\n    }\n    if (body.username && body.eventTypeSlug && body.organizationSlug) {\n      throw new NotFoundException(\n        `Event type with slug ${body.eventTypeSlug} belonging to user ${body.username} within organization ${body.organizationSlug} not found.`\n      );\n    }\n    if (body.teamSlug && body.eventTypeSlug && !body.organizationSlug) {\n      throw new NotFoundException(\n        `Event type with slug ${body.eventTypeSlug} belonging to team ${body.teamSlug} not found.`\n      );\n    }\n    if (body.teamSlug && body.eventTypeSlug && body.organizationSlug) {\n      throw new NotFoundException(\n        `Event type with slug ${body.eventTypeSlug} belonging to team ${body.teamSlug} within organization ${body.organizationSlug} not found.`\n      );\n    }\n    throw new NotFoundException(`Event type with id ${body.eventTypeId} not found.`);\n  }",
    "endLine": 32,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-handleeventtypetobebookednotfound-cc55780172",
    "sourcePath": "apps/api/v2/src/platform/bookings/2024-08-13/services/errors.service.ts",
    "startLine": 8,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/apps/api/v2/src/platform/bookings/2024-08-13/services/errors.service.ts#L8-L32",
    "verifiedSourceHash": "sha256:6c206ba922a126f80be965f2fa7801bc7ce7c563356bdb9fdd9973eb17e8f685"
  },
  {
    "anchorId": "source-repository-health-complexity-isalreadybusy-86d18ada30",
    "code": "   * Checks if already marked busy by ancestors or siblings\n   */\n  isAlreadyBusy(start: Dayjs, unit: IntervalLimitUnit, timeZone?: string) {\n    if (this.busyMap.has(LimitManager.createKey(start, \"year\", timeZone))) return true;\n\n    if (unit === \"month\" && this.busyMap.has(LimitManager.createKey(start, \"month\", timeZone))) {\n      return true;\n    } else if (\n      unit === \"week\" &&\n      // weeks can be part of two months\n      ((this.busyMap.has(LimitManager.createKey(start, \"month\", timeZone)) &&\n        this.busyMap.has(LimitManager.createKey(start.endOf(\"week\"), \"month\", timeZone))) ||\n        this.busyMap.has(LimitManager.createKey(start, \"week\", timeZone)))\n    ) {\n      return true;\n    } else if (\n      unit === \"day\" &&\n      (this.busyMap.has(LimitManager.createKey(start, \"month\", timeZone)) ||\n        this.busyMap.has(LimitManager.createKey(start, \"week\", timeZone)) ||\n        this.busyMap.has(LimitManager.createKey(start, \"day\", timeZone)))\n    ) {\n      return true;\n    } else {\n      return false;\n    }\n  }",
    "endLine": 68,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Autofix",
      "icuArgs": {},
      "msgid": "scribe.report.finding.autofix.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Autofix"
        }
      }
    },
    "language": "typescript",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-complexity-isalreadybusy-86d18ada30",
    "sourcePath": "packages/lib/intervalLimits/limitManager.ts",
    "startLine": 43,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/lib/intervalLimits/limitManager.ts#L43-L68",
    "verifiedSourceHash": "sha256:a99b1c5073e66c436ab2abc2167006a59ed09fb96b84ab3f668471c6f8ec2c59"
  },
  {
    "anchorId": "source-repository-health-showcase-sampling",
    "code": "model User {\n  id    Int     @id @default(autoincrement())\n  email String  @unique\n  name  String?\n  calcomUserId Int? @unique\n  calcomUsername String? @unique\n  refreshToken String? @unique\n  accessToken String? @unique\n  createdAt DateTime @default(now())\n  updatedAt DateTime @default(now())\n\n}",
    "endLine": 26,
    "label": {
      "defaultLocale": "en-US",
      "defaultText": "Source evidence",
      "icuArgs": {},
      "msgid": "scribe.report.repositoryHealth.sourceSnippet.title",
      "provenance": "template",
      "reviewState": "reviewed",
      "values": {
        "en-US": {
          "fallback": false,
          "reviewed": true,
          "text": "Source evidence"
        }
      }
    },
    "language": "prisma",
    "pagePath": "findings/finding-repository-health/index.html",
    "snippetId": "source-repository-health-showcase-sampling",
    "sourcePath": "packages/platform/examples/base/prisma/schema.prisma",
    "startLine": 15,
    "vcsPermalink": "https://github.com/calcom/cal.com/blob/180ede28f0bddf2738933a6e60a8e80f6116d7da/packages/platform/examples/base/prisma/schema.prisma#L15-L26",
    "verifiedSourceHash": "sha256:d4a1dc96a378c2d7de1da8a75f5b2a1361f52e8b10719ff0955c0f70edbba1f7"
  }
]
;
