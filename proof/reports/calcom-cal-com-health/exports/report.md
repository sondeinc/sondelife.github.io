# Cal.diy Repository Health

Sonde Scribe alpha

Scope: calcom/cal.com repository health
Runtime: file-direct
Report type: health
Export source: exports/report.md

<a id="section-overview"></a>
## Overview

This health report is generated from the analyzed checkout and reusable Scribe report artifacts, with public static assets separated from private generation receipts.

**Health observation:** calcom/cal.com scores 572/1000 (F) for repository health across analysis completeness, repository coverage, architecture evidence, and code health. It includes 6,306 source files, 120 package manifests, 210 build configs, 7 resource detections, and 604 database schema artifacts.

- **Repository shape:** 6306 source files across 7 languages.
- **Sonde Score:** **572** / 1000 (F)
- **Evidence coverage:** 120 package manifests, 210 build configs, and 604 database schema artifacts.

<a id="diagram-repository-health"></a>
## Source data

The source data summarizes repository health inputs collected from calcom/cal.com: apex, css, javascript, php, prisma, sql, and typescript, NestJS, Next.js, React, Prisma ORM, tRPC API, 101 data entities, 255 API endpoints (tRPC (199), REST/HTTP (56)), 0 message channels, 0 config keys, and 50 CI/CD config files for GitHub Actions.

Projection: Source data
Source: finding-repository-health
Mermaid: unavailable
SVG: unavailable

- **Source:** Files: 6306 · LOC: 244805 · Classes: 1178 · Types: 2418 · Interfaces: 767
- **Languages:** 7 · apex, css, javascript, php, prisma, sql, typescript
- **Frameworks:** 9 · NestJS, Next.js, React, Prisma ORM, tRPC API, ASP.NET WebAPI/MVC Endpoints, Express/Fastify/Hono API Endpoints, process.env (Node.js), TypeORM
- **Packages and build:** Package manifests: 120 · Build configs: 210
- **CI/CD:** 50 · GitHub Actions
- **Resource detections:** 7 · ASP.NET WebAPI/MVC Endpoints, Express/Fastify/Hono API Endpoints, Next.js API Routes, Prisma ORM, process.env (Node.js), tRPC API Procedures, TypeORM
- **Database model:** Schema artifacts: 604 · Entities: 101 · Fields: 843 · Relationships: 263
- **API endpoints:** 255 · tRPC (199), REST/HTTP (56)
- **Other runtime surfaces:** Message channels: 0 · Config keys: 0
- **Sonde Performance:** Analysis: 6306 files · Payload: 50.6 MB

<a id="finding-repository-health-complexity-handler-71962a93c2"></a>
## Critical complexity in handler

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/bookings/lib/service/RegularBookingService.ts:486 has cyclomatic complexity 269, cognitive complexity 504, and maintainability 0.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-handler-71962a93c2"></a>
### Autofix

packages/features/bookings/lib/service/RegularBookingService.ts L484-L2578

Source: packages/features/bookings/lib/service/RegularBookingService.ts L484-L2578

```typescript
}

async function handler(
  this: RegularBookingService,
  input: BookingHandlerInput,
  deps: IBookingServiceDependencies,
  bookingDataSchemaGetter: BookingDataSchemaGetter = getBookingDataSchema
) {
  const {
    bookingData: rawBookingData,
    userId,
    userUuid,
    platformClientId,
    platformCancelUrl,
    platformBookingUrl,
    platformRescheduleUrl,
    platformBookingLocation,
    hostname,
    forcedSlug,
    areCalendarEventsEnabled = true,
    skipAvailabilityCheck = false,
    skipEventLimitsCheck = false,
    skipCalendarSyncTaskCreation = false,
    traceContext: passedTraceContext,
  } = input;
  let bookingEmailsAndSmsTaskerAction: BookingActionType = BookingActionMap.requested;

  const traceContext = passedTraceContext
    ? passedTraceContext
    : distributedTracing.createTrace("booking_creation");

  const tracingLogger = distributedTracing.getTracingLogger(traceContext, {
    eventTypeId: rawBookingData.eventTypeId,
    userId: userId,
    eventTypeSlug: rawBookingData.eventTypeSlug,
  });

  const isPlatformBooking = !!platformClientId;

  const eventType = await getEventType({
    eventTypeId: rawBookingData.eventTypeId,
    eventTypeSlug: rawBookingData.eventTypeSlug,
  });

  // Early validation: Check reschedule restrictions if rescheduling
  await validateRescheduleRestrictions({
    rescheduleUid: rawBookingData.rescheduleUid,
    userId: userId ?? null,
    eventType: eventType
      ? {
          seatsPerTimeSlot: eventType.seatsPerTimeSlot,
          minimumRescheduleNotice: eventType.minimumRescheduleNotice ?? null,
        }
      : null,
  });

  const bookingDataSchema = bookingDataSchemaGetter({
    view: rawBookingData.rescheduleUid ? "reschedule" : "booking",
    bookingFields: eventType.bookingFields,
  });

  const bookingData = await getBookingData({
    reqBody: rawBookingData,
    eventType,
    schema: bookingDataSchema,
  });

  const {
    recurringCount,
    noEmail,
    eventTypeId,
    eventTypeSlug,
    hasHashedBookingLink,
    language,
    appsStatus: reqAppsStatus,
    name: bookerName,
    attendeePhoneNumber: bookerPhoneNumber,
    email: bookerEmail,
    guests: reqGuests,
    location,
    notes: additionalNotes,
    smsReminderNumber,
    rescheduleReason,
    luckyUsers,
    routedTeamMemberIds,
    rrHostSubsetIds,
    _isDryRun: isDryRun = false,
    ...reqBody
  } = bookingData;

  let troubleshooterData = buildTroubleshooterData({
    eventType,
  });

  const emailsAndSmsHandler = new BookingEmailSmsHandler({ logger: tracingLogger });

  try {
    await checkIfBookerEmailIsBlocked({
      loggedInUserId: userId,
      bookerEmail,
      verificationCode: reqBody.verificationCode,
      isReschedule: !!rawBookingData.rescheduleUid,
    });
  } catch (error) {
    if (error instanceof ErrorWithCode) {
      throw new HttpError({ statusCode: 403, message: error.message });
    }
    throw error;
  }

  const spamCheckService = getSpamCheckService();

  const eventTypeOrganizationId =
    eventType.team?.parentId ??
    eventType.parent?.team?.parentId ??
    eventType.owner?.profiles?.[0]?.organizationId ??
    null;
  spamCheckService.startCheck({ email: bookerEmail, organizationId: eventTypeOrganizationId });

  if (!rawBookingData.rescheduleUid) {
    await checkActiveBookingsLimitForBooker({
      eventTypeId,
      maxActiveBookingsPerBooker: eventType.maxActiveBookingsPerBooker,
      bookerEmail,
      offerToRescheduleLastBooking: eventType.maxActiveBookingPerBookerOfferReschedule,
    });
  }

  if (eventType.requiresBookerEmailVerification && !rawBookingData.rescheduleUid) {
    const verificationCode = reqBody.verificationCode;
    if (!verificationCode) {
      throw new HttpError({
        statusCode: 400,
        message: "email_verification_required",
      });
    }

    try {
      await verifyCodeUnAuthenticated(bookerEmail, verificationCode);
    } catch {
      throw new HttpError({
        statusCode: 400,
        message: "invalid_verification_code",
      });
    }
  }

  if (isEventTypeLoggingEnabled({ eventTypeId, usernameOrTeamName: reqBody.user })) {
    tracingLogger.settings.minLevel = 0;
  }

  const fullName = getFullName(bookerName);
  // Why are we only using "en" locale
  const tGuests = await getTranslation("en", "common");

  const dynamicUserList = Array.isArray(reqBody.user) ? reqBody.user : getUsernameList(reqBody.user);
  if (!eventType)
    throw new HttpError({
      statusCode: 404,
      message: "event_type_not_found",
    });

  if (eventType.seatsPerTimeSlot && eventType.recurringEvent) {
    throw new HttpError({
      statusCode: 400,
      message: "recurring_event_seats_error",
    });
  }

  const bookingSeat = reqBody.rescheduleUid ? await getSeatedBooking(reqBody.rescheduleUid) : null;
  const rescheduleUid = bookingSeat ? bookingSeat.booking.uid : reqBody.rescheduleUid;
  const isNormalBookingOrFirstRecurringSlot = input.bookingData.allRecurringDates
    ? !!input.bookingData.isFirstRecurringSlot
    : true;

  let originalRescheduledBooking = rescheduleUid
    ? await getOriginalRescheduledBooking(rescheduleUid, !!eventType.seatsPerTimeSlot)
    : null;

  const paymentAppData = getPaymentAppData({
    ...eventType,
    metadata: eventTypeMetaDataSchemaWithTypedApps.parse(eventType.metadata),
  });

  const { userReschedulingIsOwner, isConfirmedByDefault } = await getRequiresConfirmationFlags({
    eventType,
    bookingStartTime: reqBody.start,
    userId,
    originalRescheduledBookingOrganizerId: originalRescheduledBooking?.user?.id,
    paymentAppData,
    bookerEmail,
  });

  // For unconfirmed bookings or round robin bookings with the same attendee and timeslot, return the original booking
  if (
    (!isConfirmedByDefault && !userReschedulingIsOwner) ||
    eventType.schedulingType === SchedulingType.ROUND_ROBIN
  ) {
    const requiresPayment = !Number.isNaN(paymentAppData.price) && paymentAppData.price > 0;

    const existingBooking = await deps.bookingRepository.getValidBookingFromEventTypeForAttendee({
      eventTypeId,
      bookerEmail,
      bookerPhoneNumber,
      startTime: new Date(dayjs(reqBody.start).utc().format()),
      filterForUnconfirmed: !isConfirmedByDefault,
    });

    if (existingBooking) {
      const hasPayments = existingBooking.payment.length > 0;
      const isPaidBooking = existingBooking.paid || !hasPayments;

      const shouldShowPaymentForm = requiresPayment && !isPaidBooking;

      const firstPayment = shouldShowPaymentForm ? existingBooking.payment[0] : undefined;

      const bookingResponse = {
        ...existingBooking,
        user: {
          ...existingBooking.user,
          email: null,
        },
        paymentRequired: shouldShowPaymentForm,
        seatReferenceUid: "",
      };

      return {
        ...bookingResponse,
        luckyUsers: bookingResponse.userId ? [bookingResponse.userId] : [],
        isDryRun,
        ...(isDryRun ? { troubleshooterData } : {}),
        paymentUid: firstPayment?.uid,
        paymentId: firstPayment?.id,
        previousBooking: originalRescheduledBooking
          ? {
              uid: originalRescheduledBooking.uid,
              startTime: originalRescheduledBooking.startTime,
              endTime: originalRescheduledBooking.endTime,
            }
          : null,
      };
    }
  }

  const isTeamEventType =
    !!eventType.schedulingType && ["COLLECTIVE", "ROUND_ROBIN"].includes(eventType.schedulingType);

  // Use "booking" mode to bypass cache for booking confirmation
  const calendarFetchMode = "booking" as const;

  tracingLogger.info(
    `Booking eventType ${eventTypeId} started`,
    safeStringify({
      reqBody: {
        user: reqBody.user,
        eventTypeId,
        eventTypeSlug,
        startTime: reqBody.start,
        endTime: reqBody.end,
        rescheduleUid: reqBody.rescheduleUid,
        location: location,
        timeZone: reqBody.timeZone,
      },
      isTeamEventType,
      eventType: getPiiFreeEventType(eventType),
      dynamicUserList,
      paymentAppData: {
        enabled: paymentAppData.enabled,
        price: paymentAppData.price,
        paymentOption: paymentAppData.paymentOption,
        currency: paymentAppData.currency,
        appId: paymentAppData.appId,
      },
    })
  );

  const user = eventType.users.find((user) => user.id === eventType.userId);
  const userSchedule = user?.schedules.find((schedule) => schedule.id === user?.defaultScheduleId);
  const eventTimeZone = eventType.schedule?.timeZone ?? userSchedule?.timeZone;

  await validateBookingTimeIsNotOutOfBounds<typeof eventType>(
    reqBody.start,
    reqBody.timeZone,
    eventType,
    eventTimeZone,
    tracingLogger
  );

  validateEventLength({
    reqBodyStart: reqBody.start,
    reqBodyEnd: reqBody.end,
    eventTypeMultipleDuration: eventType.metadata?.multipleDuration,
    eventTypeLength: eventType.length,
    logger: tracingLogger,
  });

  const contactOwnerFromReq = reqBody.teamMemberEmail ?? null;

  const skipContactOwner = shouldIgnoreContactOwner({
    skipContactOwner: reqBody.skipContactOwner ?? null,
    rescheduleUid: reqBody.rescheduleUid ?? null,
    routedTeamMemberIds: routedTeamMemberIds ?? null,
  });

  const contactOwnerEmail = skipContactOwner ? null : contactOwnerFromReq;
  const _crmRecordId: string | undefined = reqBody.crmRecordId ?? undefined;

  const { qualifiedRRUsers, additionalFallbackRRUsers, fixedUsers } = await loadAndValidateUsers({
    hostname,
    forcedSlug,
    isPlatform: isPlatformBooking,
    eventType,
    eventTypeId,
    dynamicUserList,
    logger: tracingLogger,
    routedTeamMemberIds: routedTeamMemberIds ?? null,
    contactOwnerEmail,
    rescheduleUid: reqBody.rescheduleUid || null,
    rrHostSubsetIds: rrHostSubsetIds ?? undefined,
  });

  // We filter out users but ensure allHostUsers remain same.
  let users = [...qualifiedRRUsers, ...additionalFallbackRRUsers, ...fixedUsers];

  const firstUser = users[0];

  let { locationBodyString, organizerOrFirstDynamicGroupMemberDefaultLocationUrl } = getLocationValuesForDb({
    dynamicUserList,
    users,
    location,
  });

  if (!skipEventLimitsCheck) {
    await deps.checkBookingAndDurationLimitsService.checkBookingAndDurationLimits({
      eventType,
      reqBodyStart: reqBody.start,
      reqBodyRescheduleUid: reqBody.rescheduleUid,
    });
  }

  let luckyUserResponse;
  let isFirstSeat = true;
  let availableUsers: IsFixedAwareUser[] = [];

  if (eventType.seatsPerTimeSlot) {
    const booking = await deps.prismaClient.booking.findFirst({
      where: {
        eventTypeId: eventType.id,
        startTime: new Date(dayjs(reqBody.start).utc().format()),
        status: BookingStatus.ACCEPTED,
      },
      select: {
        userId: true,
        attendees: { select: { email: true } },
      },
    });

    if (booking) {
      isFirstSeat = false;
      if (eventType.schedulingType === SchedulingType.ROUND_ROBIN) {
        const fixedHosts = users.filter((user) => user.isFixed);
        const originalNonFixedHost = users.find((user) => !user.isFixed && user.id === booking.userId);

        if (originalNonFixedHost) {
          users = [...fixedHosts, originalNonFixedHost];
        } else {
          const attendeeEmailSet = new Set(booking.attendees.map((attendee) => attendee.email));

          // In this case, the first booking user is a fixed host, so the chosen non-fixed host is added as an attendee of the booking
          const nonFixedAttendeeHost = users.find(
            (user) => !user.isFixed && attendeeEmailSet.has(user.email)
          );
          users = [...fixedHosts, ...(nonFixedAttendeeHost ? [nonFixedAttendeeHost] : [])];
        }
      }
    }
  }

  //checks what users are available
  if (isFirstSeat) {
    const eventTypeWithUsers: Omit<getEventTypeResponse, "users"> & {
      users: IsFixedAwareUserWithCredentials[];
    } = {
      ...eventType,
      minimumRescheduleNotice: eventType.minimumRescheduleNotice ?? null,
      users: users as IsFixedAwareUserWithCredentials[],
      ...(eventType.recurringEvent && {
        recurringEvent: {
          ...eventType.recurringEvent,
          count: recurringCount || eventType.recurringEvent.count,
        },
      }),
    };
    if (
      input.bookingData.allRecurringDates &&
      input.bookingData.isFirstRecurringSlot &&
      input.bookingData.numSlotsToCheckForAvailability
    ) {
      const isTeamEvent =
        eventType.schedulingType === SchedulingType.COLLECTIVE ||
        eventType.schedulingType === SchedulingType.ROUND_ROBIN;

      const fixedUsers = isTeamEvent
        ? eventTypeWithUsers.users.filter((user: IsFixedAwareUserWithCredentials) => user.isFixed)
        : [];

      for (
        let i = 0;
        i < input.bookingData.allRecurringDates.length &&
        i < input.bookingData.numSlotsToCheckForAvailability;
        i++
      ) {
        const start = input.bookingData.allRecurringDates[i].start;
        const end = input.bookingData.allRecurringDates[i].end;
        if (isTeamEvent) {
          // each fixed user must be available
          for (const key in fixedUsers) {
            if (!skipAvailabilityCheck) {
              await ensureAvailableUsers(
                { ...eventTypeWithUsers, users: [fixedUsers[key]] },
                {
                  dateFrom: dayjs(start).tz(reqBody.timeZone).format(),
                  dateTo: dayjs(end).tz(reqBody.timeZone).format(),
                  timeZone: reqBody.timeZone,
                  originalRescheduledBooking: originalRescheduledBooking ?? null,
                },
                tracingLogger,
                calendarFetchMode
              );
            }
          }
        } else {
          if (!skipAvailabilityCheck) {
            await ensureAvailableUsers(
              eventTypeWithUsers,
              {
                dateFrom: dayjs(start).tz(reqBody.timeZone).format(),
                dateTo: dayjs(end).tz(reqBody.timeZone).format(),
                timeZone: reqBody.timeZone,
                originalRescheduledBooking,
              },
              tracingLogger,
              calendarFetchMode
            );
          }
        }
      }
    }

    if (!input.bookingData.allRecurringDates || input.bookingData.isFirstRecurringSlot) {
      try {
        if (!skipAvailabilityCheck) {
          availableUsers = await ensureAvailableUsers(
            { ...eventTypeWithUsers, users: [...qualifiedRRUsers, ...fixedUsers] as IsFixedAwareUser[] },
            {
              dateFrom: dayjs(reqBody.start).tz(reqBody.timeZone).format(),
              dateTo: dayjs(reqBody.end).tz(reqBody.timeZone).format(),
              timeZone: reqBody.timeZone,
              originalRescheduledBooking,
            },
            tracingLogger,
            calendarFetchMode
          );
        } else {
          availableUsers = [...qualifiedRRUsers, ...fixedUsers] as IsFixedAwareUser[];
        }
      } catch {
        if (additionalFallbackRRUsers.length) {
          tracingLogger.debug(
            "Qualified users not available, check for fallback users",
            safeStringify({
              qualifiedRRUsers: qualifiedRRUsers.map((user) => user.id),
              additionalFallbackRRUsers: additionalFallbackRRUsers.map((user) => user.id),
            })
          );
          // can happen when contact owner not available for 2 weeks or fairness would block at least 2 weeks
          // use fallback instead
          if (!skipAvailabilityCheck) {
            availableUsers = await ensureAvailableUsers(
              {
                ...eventTypeWithUsers,
                users: [...additionalFallbackRRUsers, ...fixedUsers] as IsFixedAwareUser[],
              },
              {
                dateFrom: dayjs(reqBody.start).tz(reqBody.timeZone).format(),
                dateTo: dayjs(reqBody.end).tz(reqBody.timeZone).format(),
                timeZone: reqBody.timeZone,
                originalRescheduledBooking,
              },
              tracingLogger,
              calendarFetchMode
            );
          } else {
            availableUsers = [...additionalFallbackRRUsers, ...fixedUsers] as IsFixedAwareUser[];
          }
        } else {
          tracingLogger.debug(
            "Qualified users not available, no fallback users",
            safeStringify({
              qualifiedRRUsers: qualifiedRRUsers.map((user) => user.id),
            })
          );
          throw new Error(ErrorCode.NoAvailableUsersFound);
        }
      }

      const fixedUserPool: IsFixedAwareUser[] = [];
      const nonFixedUsers: IsFixedAwareUser[] = [];

      availableUsers.forEach((user) => {
        if (user.isFixed) {
          fixedUserPool.push(user);
        } else {
          nonFixedUsers.push(user);
        }
      });

      // Group non-fixed users by their group IDs
      const luckyUserPools = groupHostsByGroupId({
        hosts: nonFixedUsers,
        hostGroups: eventType.hostGroups,
      });

      const notAvailableLuckyUsers: typeof users = [];

      tracingLogger.debug(
        "Computed available users",
        safeStringify({
          availableUsers: availableUsers.map((user) => user.id),
          luckyUserPools: Object.fromEntries(
            Object.entries(luckyUserPools).map(([groupId, users]) => [groupId, users.map((user) => user.id)])
          ),
        })
      );

      const luckyUsers: typeof users = [];
      // loop through all non-fixed hosts and get the lucky users
      // This logic doesn't run when contactOwner is used because in that case, luckUsers.length === 1
      for (const [groupId, luckyUserPool] of Object.entries(luckyUserPools)) {
        let luckUserFound = false;
        while (luckyUserPool.length > 0 && !luckUserFound) {
          const freeUsers = luckyUserPool.filter(
            (user) => !luckyUsers.concat(notAvailableLuckyUsers).find((existing) => existing.id === user.id)
          );
          // no more freeUsers after subtracting notAvailableLuckyUsers from luckyUsers :(
          if (freeUsers.length === 0) break;
          assertNonEmptyArray(freeUsers); // make sure TypeScript knows it too with an assertion; the error will never be thrown.
          // freeUsers is ensured

          const userIdsSet = new Set(users.map((user) => user.id));
          const newLuckyUser = await deps.luckyUserService.getLuckyUser({
            availableUsers: freeUsers,
            allRRHosts: eventTypeWithUsers.hosts.filter(
              (host) =>
                !host.isFixed &&
                userIdsSet.has(host.user.id) &&
                (host.groupId === groupId || (!host.groupId && groupId === DEFAULT_GROUP_ID))
            ),
            eventType,
            meetingStartTime: new Date(reqBody.start),
          });
          if (!newLuckyUser) {
            break; // prevent infinite loop
          }
          if (
            input.bookingData.isFirstRecurringSlot &&
            eventType.schedulingType === SchedulingType.ROUND_ROBIN &&
            input.bookingData.numSlotsToCheckForAvailability &&
            input.bookingData.allRecurringDates
          ) {
            // for recurring round robin events check if lucky user is available for next slots
            try {
              for (
                let i = 0;
                i < input.bookingData.allRecurringDates.length &&
                i < input.bookingData.numSlotsToCheckForAvailability;
                i++
              ) {
                const start = input.bookingData.allRecurringDates[i].start;
                const end = input.bookingData.allRecurringDates[i].end;

                if (!skipAvailabilityCheck) {
                  await ensureAvailableUsers(
                    { ...eventTypeWithUsers, users: [newLuckyUser] },
                    {
                      dateFrom: dayjs(start).tz(reqBody.timeZone).format(),
                      dateTo: dayjs(end).tz(reqBody.timeZone).format(),
                      timeZone: reqBody.timeZone,
                      originalRescheduledBooking,
                    },
                    tracingLogger,
                    calendarFetchMode
                  );
                }
              }
              // if no error, then lucky user is available for the next slots
              luckyUsers.push(newLuckyUser);
              luckUserFound = true;
            } catch {
              notAvailableLuckyUsers.push(newLuckyUser);
              tracingLogger.info(
                `Round robin host ${newLuckyUser.name} not available for first two slots. Trying to find another host.`
              );
            }
          } else {
            luckyUsers.push(newLuckyUser);
            luckUserFound = true;
          }
        }
      }

      // ALL fixed users must be available
      if (fixedUserPool.length !== users.filter((user) => user.isFixed).length) {
        throw new Error(ErrorCode.FixedHostsUnavailableForBooking);
      }

      const roundRobinHosts = eventType.hosts.filter((host) => !host.isFixed);

      const hostGroups = groupHostsByGroupId({
        hosts: roundRobinHosts,
        hostGroups: eventType.hostGroups,
      });

      // Filter out host groups that have no hosts in them
      const nonEmptyHostGroups = Object.fromEntries(
        Object.entries(hostGroups).filter(([, hosts]) => hosts.length > 0)
      );
      // If there are RR hosts, we need to find a lucky user
      if (
        [...qualifiedRRUsers, ...additionalFallbackRRUsers].length > 0 &&
        luckyUsers.length !== (Object.keys(nonEmptyHostGroups).length || 1)
      ) {
        throw new Error(ErrorCode.RoundRobinHostsUnavailableForBooking);
      }

      // Pushing fixed user before the luckyUser guarantees the (first) fixed user as the organizer.
      users = [...fixedUserPool, ...luckyUsers];
      luckyUserResponse = { luckyUsers: luckyUsers.map((u) => u.id) };
      troubleshooterData = {
        ...troubleshooterData,
        luckyUsers: luckyUsers.map((u) => u.id),
        fixedUsers: fixedUserPool.map((u) => u.id),
        luckyUserPool: Object.values(luckyUserPools)
          .flat()
          .map((u) => u.id),
      };
    } else if (
      input.bookingData.allRecurringDates &&
      eventType.schedulingType === SchedulingType.ROUND_ROBIN
    ) {
      // all recurring slots except the first one
      const luckyUsersFromFirstBooking = luckyUsers
        ? eventTypeWithUsers.users.filter((user) => luckyUsers.find((luckyUserId) => luckyUserId === user.id))
        : [];
      const fixedHosts = eventTypeWithUsers.users.filter((user: IsFixedAwareUser) => user.isFixed);
      users = [...fixedHosts, ...luckyUsersFromFirstBooking];
      troubleshooterData = {
        ...troubleshooterData,
        luckyUsersFromFirstBooking: luckyUsersFromFirstBooking.map((u) => u.id),
        fixedUsers: fixedHosts.map((u) => u.id),
      };
    }
  }

  if (users.length === 0 && eventType.schedulingType === SchedulingType.ROUND_ROBIN) {
    tracingLogger.error(`No available users found for round robin event.`);
    throw new Error(ErrorCode.RoundRobinHostsUnavailableForBooking);
  }

  // If the team member is requested then they should be the organizer
  const organizerUser = reqBody.teamMemberEmail
    ? (users.find((user) => user.email === reqBody.teamMemberEmail) ?? users[0])
    : users[0];

  const tOrganizer = await getTranslation(organizerUser?.locale ?? "en", "common");
  const allCredentials = await getAllCredentialsIncludeServiceAccountKey(organizerUser, eventType);

  // If the Organizer himself is rescheduling, the booker should be sent the communication in his timezone and locale.
  const attendeeInfoOnReschedule =
    userReschedulingIsOwner && originalRescheduledBooking
      ? originalRescheduledBooking.attendees.find((attendee) => attendee.email === bookerEmail)
      : null;

  const attendeeLanguage = attendeeInfoOnReschedule ? attendeeInfoOnReschedule.locale : language;
  const attendeeTimezone = attendeeInfoOnReschedule ? attendeeInfoOnReschedule.timeZone : reqBody.timeZone;

  const tAttendees = await getTranslation(attendeeLanguage ?? "en", "common");

  const isManagedEventType = !!eventType.parentId;

  // If location passed is empty , use default location of event
  // If location of event is not set , use host default
  if (locationBodyString.trim().length === 0) {
    if (eventType.locations.length > 0) {
      locationBodyString = eventType.locations[0].type;
    } else {
      locationBodyString = OrganizerDefaultConferencingAppType;
    }
  }

  // use host default
  if (locationBodyString === OrganizerDefaultConferencingAppType) {
    const metadataParseResult = userMetadataSchema.safeParse(organizerUser.metadata);
    const organizerMetadata = metadataParseResult.success ? metadataParseResult.data : undefined;
    const defaultApp = organizerMetadata?.defaultConferencingApp;

    if (defaultApp?.appSlug) {
      const app = getAppFromSlug(defaultApp.appSlug);
      locationBodyString = app?.appData?.location?.type || locationBodyString;

      const mainHostCalendar = eventType.destinationCalendar || organizerUser.destinationCalendar;

      if (locationBodyString === MeetLocationType && mainHostCalendar?.integration !== "google_calendar") {
        locationBodyString = "integrations:daily";
        organizerOrFirstDynamicGroupMemberDefaultLocationUrl = undefined;
      } else if (isManagedEventType || isTeamEventType) {
        organizerOrFirstDynamicGroupMemberDefaultLocationUrl = defaultApp?.appLink;
      }
    } else {
      locationBodyString = "integrations:daily";
    }
  }

  const invitee: Invitee = [
    {
      email: bookerEmail,
      name: fullName,
      phoneNumber: bookerPhoneNumber,
      firstName: (typeof bookerName === "object" && bookerName.firstName) || "",
      lastName: (typeof bookerName === "object" && bookerName.lastName) || "",
      timeZone: attendeeTimezone,
      language: { translate: tAttendees, locale: attendeeLanguage ?? "en" },
    },
  ];

  const blacklistedGuestEmails = process.env.BLACKLISTED_GUEST_EMAILS
    ? process.env.BLACKLISTED_GUEST_EMAILS.split(",")
    : [];

  const guestEmails = (reqGuests || []).map((email) => extractBaseEmail(email).toLowerCase());
  const guestUsers = await deps.userRepository.findManyByEmailsWithEmailVerificationSettings({
    emails: guestEmails,
  });

  const emailToRequiresVerification = new Map<string, boolean>();
  for (const user of guestUsers) {
    const matchedBase = extractBaseEmail(user.matchedEmail ?? user.email).toLowerCase();
    emailToRequiresVerification.set(matchedBase, user.requiresBookerEmailVerification === true);
  }

  const guestsRemoved: string[] = [];
  const guests = (reqGuests || []).reduce((guestArray, guest) => {
    const baseGuestEmail = extractBaseEmail(guest).toLowerCase();

    if (blacklistedGuestEmails.some((e) => e.toLowerCase() === baseGuestEmail)) {
      guestsRemoved.push(guest);
      return guestArray;
    }

    if (emailToRequiresVerification.get(baseGuestEmail)) {
      guestsRemoved.push(guest);
      return guestArray;
    }

    // If it's a team event, remove the team member from guests
    if (isTeamEventType && users.some((user) => user.email === guest)) {
      return guestArray;
    }
    guestArray.push({
      email: guest,
      name: "",
      firstName: "",
      lastName: "",
      timeZone: attendeeTimezone,
      language: { translate: tGuests, locale: "en" },
    });
    return guestArray;
  }, [] as Invitee);

  if (guestsRemoved.length > 0) {
    tracingLogger.info("Removed guests from the booking", guestsRemoved);
  }

  const seed = `${organizerUser.username}:${dayjs(reqBody.start).utc().format()}:${Date.now()}`;
  const uid = translator.fromUUID(uuidv5(seed, uuidv5.URL));

  // For static link based video apps, it would have the static URL value instead of it's type(e.g. integrations:campfire_video)
  // This ensures that createMeeting isn't called for static video apps as bookingLocation becomes just a regular value for them.
  const { bookingLocation, conferenceCredentialId: eventTypeCredentialId } =
    organizerOrFirstDynamicGroupMemberDefaultLocationUrl
      ? {
          bookingLocation: organizerOrFirstDynamicGroupMemberDefaultLocationUrl,
          conferenceCredentialId: undefined,
        }
      : getLocationValueForDB(locationBodyString, eventType.locations);

  // Use per-host credential if available, otherwise fall back to event type credential
  const conferenceCredentialId = eventTypeCredentialId;

  tracingLogger.info("locationBodyString", locationBodyString);
  tracingLogger.info("event type locations", eventType.locations);

  const customInputs = getCustomInputsResponses(reqBody, eventType.customInputs);
  const attendeesList = [...invitee, ...guests];

  const responses = reqBody.responses || null;
  const evtName = !eventType?.isDynamic ? eventType.eventName : responses?.title;
  const eventNameObject = {
    //TODO: Can we have an unnamed attendee? If not, I would really like to throw an error here.
    attendeeName: fullName || "Nameless",
    eventType: eventType.title,
    eventName: evtName,
    // we send on behalf of team if >1 round robin attendee | collective
    teamName: eventType.schedulingType === "COLLECTIVE" || users.length > 1 ? eventType.team?.name : null,
    // TODO: Can we have an unnamed organizer? If not, I would really like to throw an error here.
    host: organizerUser.name || "Nameless",
    location: bookingLocation,
    eventDuration: dayjs(reqBody.end).diff(reqBody.start, "minutes"),
    bookingFields: { ...responses },
    t: tOrganizer,
  };

  const iCalUID = getICalUID({
    event: { iCalUID: originalRescheduledBooking?.iCalUID, uid: originalRescheduledBooking?.uid },
    uid,
  });
  // For bookings made before introducing iCalSequence, assume that the sequence should start at 1. For new bookings start at 0.
  const iCalSequence = getICalSequence(originalRescheduledBooking);
  const organizerOrganizationProfile = await deps.prismaClient.profile.findFirst({
    where: {
      userId: organizerUser.id,
    },
    select: {
      organizationId: true,
      username: true,
      organization: { select: { hideBranding: true } },
    },
  });

  const organizerOrganizationId = organizerOrganizationProfile?.organizationId;
  const bookerUrl = process.env.NEXT_PUBLIC_WEBAPP_URL || "https://app.cal.com";

  const destinationCalendar = eventType.destinationCalendar
    ? [eventType.destinationCalendar]
    : organizerUser.destinationCalendar
      ? [organizerUser.destinationCalendar]
      : null;

  let organizerEmail = organizerUser.email || "Email-less";
  if (eventType.useEventTypeDestinationCalendarEmail && destinationCalendar?.[0]?.primaryEmail) {
    organizerEmail = destinationCalendar[0].primaryEmail;
  } else if (eventType.secondaryEmailId && eventType.secondaryEmail?.email) {
    organizerEmail = eventType.secondaryEmail.email;
  }

  //update cal event responses with latest location value , later used by webhook
  if (reqBody.calEventResponses)
    reqBody.calEventResponses.location.value = {
      value: platformBookingLocation ?? bookingLocation,
      optionValue: "",
    };

  // Only attach recurring config when this booking belongs to a recurring series.
  const computedRecurringEvent =
    reqBody.recurringEventId && eventType.recurringEvent
      ? { ...eventType.recurringEvent, count: recurringCount ?? eventType.recurringEvent.count }
      : undefined;

  const { teamMembers, teamDestinationCalendars } = await computeTeamData({
    isTeamEventType,
    schedulingType: eventType.schedulingType,
    users,
    organizerEmail: organizerUser.email,
  });

  const teamInfo = eventType.team;

  const eventName = getEventName(eventNameObject);

  let evt: BuiltCalendarEvent = new CalendarEventBuilder({
    bookerUrl,
    title: eventName,
    startTime: dayjs(reqBody.start).utc().format(),
    endTime: dayjs(reqBody.end).utc().format(),
    type: eventType.slug,
    organizer: {
      id: organizerUser.id,
      name: organizerUser.name || "Nameless",
      email: organizerEmail,
      username: organizerUser.username || undefined,
      usernameInOrg: organizerOrganizationProfile?.username || undefined,
      timeZone: organizerUser.timeZone,
      language: { translate: tOrganizer, locale: organizerUser.locale ?? "en" },
      timeFormat: getTimeFormatStringFromUserTimeFormat(organizerUser.timeFormat),
    },
    attendees: attendeesList,
    additionalNotes,
  })
    .withEventType({
      description: eventType.description,
      id: eventType.id,
      hideCalendarNotes: eventType.hideCalendarNotes,
      hideCalendarEventDetails: eventType.hideCalendarEventDetails,
      hideOrganizerEmail: eventType.hideOrganizerEmail,
      schedulingType: eventType.schedulingType,
      seatsPerTimeSlot: eventType.seatsPerTimeSlot,
      // if seats are not enabled we should default true
      seatsShowAttendees: eventType.seatsPerTimeSlot ? eventType.seatsShowAttendees : true,
      seatsShowAvailabilityCount: eventType.seatsPerTimeSlot ? eventType.seatsShowAvailabilityCount : true,
      customReplyToEmail: eventType.customReplyToEmail,
      disableRescheduling: eventType.disableRescheduling ?? false,
      disableCancelling: eventType.disableCancelling ?? false,
    })
    .withMetadataAndResponses({
      additionalNotes,
      customInputs,
      responses: reqBody.calEventResponses || null,
      userFieldsResponses: reqBody.calEventUserFieldsResponses || null,
    })
    .withLocation({
      location: platformBookingLocation ?? bookingLocation, // Will be processed by the EventManager later.
      conferenceCredentialId,
    })
    .withDestinationCalendar(
      teamDestinationCalendars.length > 0
        ? [...(destinationCalendar ?? []), ...teamDestinationCalendars]
        : destinationCalendar
    )
    .withIdentifiers({ iCalUID, iCalSequence })
    .withConfirmation({
      requiresConfirmation: !isConfirmedByDefault,
      isConfirmedByDefault,
    })
    .withPlatformVariables({
      platformClientId,
      platformRescheduleUrl,
      platformCancelUrl,
      platformBookingUrl,
    })
    .withOrganization(organizerOrganizationId)
    .withHashedLink(hasHashedBookingLink ? (reqBody.hashedLink ?? null) : null)
    .withRecurring(computedRecurringEvent ?? undefined)
    .withRecurringEventId(input.bookingData.thirdPartyRecurringEventId)
    .withTeam(
      isTeamEventType
        ? {
            members: teamMembers,
            name: teamInfo?.name || "Nameless",
            id: teamInfo?.id ?? 0,
          }
        : undefined
    )
    .withHideBranding(
      await getEventTypeService().shouldHideBrandingForEventType(eventType.id, {
        team: eventType.team
          ? { hideBranding: eventType.team.hideBranding, parent: eventType.team.parent }
          : null,
        owner: {
          id: organizerUser.id,
          hideBranding: organizerUser.hideBranding,
          profiles: organizerOrganizationProfile
            ? [{ organization: organizerOrganizationProfile.organization }]
            : [],
        },
      } satisfies EventTypeBrandingData)
    )
    .build();

  // data needed for triggering webhooks
  const eventTypeInfo: EventTypeInfo = {
    eventTitle: eventType.title,
    eventDescription: eventType.description,
    price: paymentAppData.price,
    currency: eventType.currency,
    length: dayjs(reqBody.end).diff(dayjs(reqBody.start), "minutes"),
  };

  const subscriberOptions: GetSubscriberOptions = {
    userId: organizerUser.id,
    eventTypeId,
    triggerEvent: WebhookTriggerEvents.BOOKING_CREATED,
    teamId: null,
    orgId: null,
    oAuthClientId: platformClientId,
  };

  const eventTrigger: WebhookTriggerEvents = rescheduleUid
    ? WebhookTriggerEvents.BOOKING_RESCHEDULED
    : WebhookTriggerEvents.BOOKING_CREATED;

  subscriberOptions.triggerEvent = eventTrigger;

  const subscriberOptionsMeetingEnded = {
    userId: organizerUser.id,
    eventTypeId,
    triggerEvent: WebhookTriggerEvents.MEETING_ENDED,
    teamId: null,
    orgId: null,
    oAuthClientId: platformClientId,
  };

  const subscriberOptionsMeetingStarted = {
    userId: organizerUser.id,
    eventTypeId,
    triggerEvent: WebhookTriggerEvents.MEETING_STARTED,
    teamId: null,
    orgId: null,
    oAuthClientId: platformClientId,
  };

  const spamCheckResult = await spamCheckService.waitForCheck();

  if (spamCheckResult.isBlocked) {
    const DECOY_ORGANIZER_NAMES = ["Alex Smith", "Jordan Taylor", "Sam Johnson", "Chris Morgan"];
    const randomOrganizerName =
      DECOY_ORGANIZER_NAMES[Math.floor(Math.random() * DECOY_ORGANIZER_NAMES.length)];

    const eventName = getEventName({
      ...eventNameObject,
      host: randomOrganizerName,
    });

    return {
      id: 0,
      uid,
      iCalUID: "",
      status: BookingStatus.ACCEPTED,
      eventTypeId: eventType.id,
      user: {
        name: randomOrganizerName,
        timeZone: "UTC",
        email: null,
      },
      userId: null,
      userUuid: null,
      title: eventName,
      startTime: new Date(reqBody.start),
      endTime: new Date(reqBody.end),
      createdAt: new Date(),
      updatedAt: new Date(),
      attendees: [
        {
          id: 0,
          email: bookerEmail,
          name: fullName,
          timeZone: reqBody.timeZone,
          locale: null,
          phoneNumber: null,
          bookingId: null,
          noShow: null,
        },
      ],
      oneTimePassword: null,
      smsReminderNumber: null,
      metadata: {},
      idempotencyKey: null,
      userPrimaryEmail: null,
      description: eventType.description || null,
      customInputs: null,
      responses: null,
      location: bookingLocation,
      paid: false,
      cancellationReason: null,
      rejectionReason: null,
      dynamicEventSlugRef: null,
      dynamicGroupSlugRef: null,
      fromReschedule: null,
      recurringEventId: null,
      scheduledJobs: [],
      rescheduledBy: null,
      destinationCalendarId: null,
      reassignReason: null,
      reassignById: null,
      rescheduled: false,
      isRecorded: false,
      iCalSequence: 0,
      rating: null,
      ratingFeedback: null,
      noShowHost: null,
      cancelledBy: null,
      creationSource: CreationSource.WEBAPP,
      references: [],
      payment: [],
      isDryRun: false,
      paymentRequired: false,
      paymentUid: undefined,
      luckyUsers: [],
      paymentId: undefined,
      seatReferenceUid: undefined,
      isShortCircuitedBooking: true,
      previousBooking: originalRescheduledBooking
        ? {
            uid: originalRescheduledBooking.uid,
            startTime: originalRescheduledBooking.startTime,
            endTime: originalRescheduledBooking.endTime,
          }
        : null,
    };
  }

  // For seats, if the booking already exists then we want to add the new attendee to the existing booking
  if (eventType.seatsPerTimeSlot) {
    const newBooking = await handleSeats({
      rescheduleUid,
      reqBookingUid: reqBody.bookingUid,
      eventType,
      evt,
      invitee,
      allCredentials,
      organizerUser,
      originalRescheduledBooking,
      bookerEmail,
      bookerPhoneNumber,
      tAttendees,
      bookingSeat,
      reqUserId: input.userId,
      reqUserUuid: userUuid,
      rescheduleReason,
      reqBodyUser: reqBody.user,
      noEmail,
      isConfirmedByDefault,
      additionalNotes,
      reqAppsStatus,
      attendeeLanguage,
      paymentAppData,
      fullName,
      smsReminderNumber,
      eventTypeInfo,
      uid,
      eventTypeId,
      reqBodyMetadata: reqBody.metadata,
      subscriberOptions,
      eventTrigger,
      responses,
      rescheduledBy: reqBody.rescheduledBy,
      isDryRun,
      traceContext,
    });

    if (newBooking) {
      const bookingResponse = {
        ...newBooking,
        user: {
          ...newBooking.user,
          email: null,
        },
        paymentRequired: false,
        isDryRun: isDryRun,
        ...(isDryRun ? { troubleshooterData } : {}),
      };
      return {
        ...bookingResponse,
        ...luckyUserResponse,
        previousBooking: originalRescheduledBooking
          ? {
              uid: originalRescheduledBooking.uid,
              startTime: originalRescheduledBooking.startTime,
              endTime: originalRescheduledBooking.endTime,
            }
          : null,
      };
    } else {
      // Rescheduling logic for the original seated event was handled in handleSeats
      // We want to use new booking logic for the new time slot
      originalRescheduledBooking = null;
      const updatedEvt = CalendarEventBuilder.fromEvent(evt)
        ?.withIdentifiers({
          iCalUID: getICalUID({
            attendeeId: bookingSeat?.attendeeId,
          }),
        })
        .build();

      evt = updatedEvt;
    }
  }

  const changedOrganizer =
    !!originalRescheduledBooking &&
    (eventType.schedulingType === SchedulingType.ROUND_ROBIN ||
      eventType.schedulingType === SchedulingType.COLLECTIVE) &&
    originalRescheduledBooking.userId !== evt.organizer.id;

  const skipDeleteEventsAndMeetings = changedOrganizer;

  const isBookingRequestedReschedule =
    !!originalRescheduledBooking &&
    !!originalRescheduledBooking.rescheduled &&
    originalRescheduledBooking.status === BookingStatus.CANCELLED;

  if (
    changedOrganizer &&
    originalRescheduledBooking &&
    originalRescheduledBooking?.user?.name &&
    organizerUser?.name
  ) {
    evt.title = updateHostInEventName(
      originalRescheduledBooking.title,
      originalRescheduledBooking.user.name,
      organizerUser.name
    );
  }

  let results: EventResult<AdditionalInformation & { url?: string; iCalUID?: string }>[] = [];
  let referencesToCreate: PartialReference[] = [];

  let booking: CreatedBooking | null = null;

  tracingLogger.debug(
    "Going to create booking in DB now",
    safeStringify({
      organizerUser: organizerUser.id,
      attendeesList: attendeesList.map((guest) => ({ timeZone: guest.timeZone })),
      requiresConfirmation: evt.requiresConfirmation,
      isConfirmedByDefault,
      userReschedulingIsOwner,
    })
  );

  let assignmentReason: { reasonEnum: AssignmentReasonEnum; reasonString: string } | undefined;

  try {
    if (!isDryRun) {
      booking = await createBooking({
        uid,
        rescheduledBy: reqBody.rescheduledBy,
        reqBody: {
          user: reqBody.user,
          metadata: reqBody.metadata,
          recurringEventId: reqBody.recurringEventId,
        },
        eventType: {
          eventTypeData: eventType,
          id: eventTypeId,
          slug: eventTypeSlug,
          organizerUser,
          isConfirmedByDefault,
          paymentAppData,
        },
        input: {
          bookerEmail,
          rescheduleReason,
          smsReminderNumber,
          responses,
        },
        evt,
        originalRescheduledBooking,
        creationSource: input.bookingData.creationSource,
        tracking: reqBody.tracking,
      });

      if (booking?.userId) {
        const usersRepository = new UsersRepository();
        await usersRepository.updateLastActiveAt(booking.userId);
        const organizerUserAvailability = availableUsers.find((user) => user.id === booking?.userId);

        criticalLogger.info(`Booking created`, {
          bookingUid: booking.uid,
          selectedCalendarIds: organizerUser.allSelectedCalendars?.map((c) => c.id) ?? [],
          availabilitySnapshot: organizerUserAvailability?.availabilityData
            ? formatAvailabilitySnapshot(organizerUserAvailability.availabilityData)
            : null,
        });
      }

      evt = CalendarEventBuilder.fromEvent(evt)
        .withUid(booking.uid ?? null)
        .build();

      evt = CalendarEventBuilder.fromEvent(evt)
        .withOneTimePassword(booking.oneTimePassword ?? null)
        .build();

      // Add assignment reason to evt for emails
      if (assignmentReason) {
        evt = CalendarEventBuilder.fromEvent(evt)
          .withAssignmentReason({
            category: getAssignmentReasonCategory(assignmentReason.reasonEnum),
            details: assignmentReason.reasonString ?? null,
          })
          .build();
      }

      if (booking?.id && eventType.seatsPerTimeSlot) {
        const currentAttendee = booking.attendees.find(
          (attendee) =>
            attendee.email === bookingData.responses.email ||
            (bookingData.responses.attendeePhoneNumber &&
              attendee.phoneNumber === bookingData.responses.attendeePhoneNumber)
        );

        // Save description to bookingSeat
        const uniqueAttendeeId = uuid();
        await deps.prismaClient.bookingSeat.create({
          data: {
            referenceUid: uniqueAttendeeId,
            data: {
              description: additionalNotes,
              responses,
            },
            metadata: reqBody.metadata,
            booking: {
              connect: {
                id: booking.id,
              },
            },
            attendee: {
              connect: {
                id: currentAttendee?.id,
              },
            },
          },
        });
        evt.attendeeSeatId = uniqueAttendeeId;
      }
    } else {
      const { booking: dryRunBooking, troubleshooterData: _troubleshooterData } = buildDryRunBooking({
        eventTypeId,
        organizerUser,
        eventName,
        startTime: reqBody.start,
        endTime: reqBody.end,
        contactOwnerFromReq,
        contactOwnerEmail,
        allHostUsers: users,
        isManagedEventType,
      });

      booking = dryRunBooking;
      troubleshooterData = {
        ...troubleshooterData,
        ..._troubleshooterData,
      };
    }
  } catch (_err) {
    const err = getServerErrorFromUnknown(_err);
    tracingLogger.error(`Booking ${eventTypeId} failed`, "Error when saving booking to db", err.message);
    if (err.cause && typeof err.cause === "object" && "code" in err.cause && err.cause.code === "P2002") {
      throw new HttpError({
        statusCode: 409,
        message: ErrorCode.BookingConflict,
      });
    }
    throw err;
  }

  // After polling videoBusyTimes, credentials might have been changed due to refreshment, so query them again.
  const credentials = await refreshCredentials(allCredentials);
  const apps = eventTypeAppMetadataOptionalSchema.parse(eventType?.metadata?.apps);
  const eventManager =
    !isDryRun && !skipCalendarSyncTaskCreation
      ? new EventManager({ ...organizerUser, credentials }, apps)
      : buildDryRunEventManager();

  let videoCallUrl;

  // this is the actual rescheduling logic
  if (!eventType.seatsPerTimeSlot && originalRescheduledBooking?.uid) {
    tracingLogger.silly("Rescheduling booking", originalRescheduledBooking.uid);
    evt = CalendarEventBuilder.fromEvent(evt)
      .withVideoCallDataFromReferences(originalRescheduledBooking.references)
      .build();
    evt.rescheduledBy = reqBody.rescheduledBy;

    // If organizer is changed in RR event then we need to delete the previous host destination calendar events
    const previousHostDestinationCalendar = originalRescheduledBooking?.destinationCalendar
      ? [originalRescheduledBooking?.destinationCalendar]
      : [];

    if (changedOrganizer) {
      // location might changed and will be new created in eventManager.create (organizer default location)
      evt.videoCallData = undefined;
      // To prevent "The requested identifier already exists" error while updating event, we need to remove iCalUID
      evt.iCalUID = undefined;
      evt.hasOrganizerChanged = true;
    }

    if (changedOrganizer && originalRescheduledBooking?.user) {
      const originalHostCredentials = await getAllCredentialsIncludeServiceAccountKey(
        originalRescheduledBooking.user,
        eventType
      );
      const refreshedOriginalHostCredentials = await refreshCredentials(originalHostCredentials);

      // Create EventManager with original host's credentials for deletion operations
      const originalHostEventManager = new EventManager(
        { ...originalRescheduledBooking.user, credentials: refreshedOriginalHostCredentials },
        apps
      );
      tracingLogger.debug("RescheduleOrganizerChanged: Deleting Event and Meeting for previous booking");
      // Create deletion event with original host's organizer info and original booking properties
      const deletionEvent = {
        ...evt,
        organizer: {
          id: originalRescheduledBooking.user.id,
          name: originalRescheduledBooking.user.name || "",
          email: originalRescheduledBooking.user.email,
          username: originalRescheduledBooking.user.username || undefined,
          timeZone: originalRescheduledBooking.user.timeZone,
          language: { translate: tOrganizer, locale: originalRescheduledBooking.user.locale ?? "en" },
          timeFormat: getTimeFormatStringFromUserTimeFormat(originalRescheduledBooking.user.timeFormat),
        },
        destinationCalendar: previousHostDestinationCalendar,
        // Override with original booking properties used by deletion operations
        startTime: originalRescheduledBooking.startTime.toISOString(),
        endTime: originalRescheduledBooking.endTime.toISOString(),
        uid: originalRescheduledBooking.uid,
        location: originalRescheduledBooking.location,
        responses: originalRescheduledBooking.responses
          ? (originalRescheduledBooking.responses as CalEventResponses)
          : evt.responses,
      };

      if (!skipCalendarSyncTaskCreation) {
        await originalHostEventManager.deleteEventsAndMeetings({
          event: deletionEvent,
          bookingReferences: originalRescheduledBooking.references,
        });
      }
    }
    // This gets overridden when updating the event - to check if notes have been hidden or not. We just reset this back
    // to the default description when we are sending the emails.
    evt.description = eventType.description;

    const updateManager = !skipCalendarSyncTaskCreation
      ? await eventManager.reschedule(
          evt,
          originalRescheduledBooking.uid,
          undefined,
          changedOrganizer,
          previousHostDestinationCalendar,
          isBookingRequestedReschedule,
          skipDeleteEventsAndMeetings
        )
      : placeholderCreatedEvent;

    results = updateManager.results;
    referencesToCreate = updateManager.referencesToCreate;

    videoCallUrl = evt.videoCallData?.url ? evt.videoCallData.url : null;

    // This gets overridden when creating the event - to check if notes have been hidden or not. We just reset this back
    // to the default description when we are sending the emails.
    evt.description = eventType.description;

    const { metadata: videoMetadata, videoCallUrl: _videoCallUrl } = getVideoCallDetails({
      results,
    });

    let metadata: AdditionalInformation = {};
    metadata = videoMetadata;
    videoCallUrl = _videoCallUrl;

    const isThereAnIntegrationError = results?.some((res) => !res.success);

    if (isThereAnIntegrationError) {
      const error = {
        errorCode: "BookingReschedulingMeetingFailed",
        message: "Booking Rescheduling failed",
      };

      tracingLogger.error(
        `EventManager.reschedule failure in some of the integrations ${organizerUser.username}`,
        safeStringify({ error, results })
      );
    } else {
      if (results.length) {
        // Handle Google Meet results
        // We use the original booking location since the evt location changes to daily
        if (bookingLocation === MeetLocationType) {
          const googleMeetResult = {
            appName: GoogleMeetMetadata.name,
            type: "conferencing",
            uid: results[0].uid,
            originalEvent: results[0].originalEvent,
          };

          // Find index of google_calendar inside createManager.referencesToCreate
          const googleCalIndex = updateManager.referencesToCreate.findIndex(
            (ref) => ref.type === "google_calendar"
          );
          const googleCalResult = results[googleCalIndex];

          if (!googleCalResult) {
            tracingLogger.warn("Google Calendar not installed but using Google Meet as location");
            results.push({
              ...googleMeetResult,
              success: false,
              calWarnings: [tOrganizer("google_meet_warning")],
            });
          }

          const googleHangoutLink = Array.isArray(googleCalResult?.updatedEvent)
            ? googleCalResult.updatedEvent[0]?.hangoutLink
            : (googleCalResult?.updatedEvent?.hangoutLink ?? googleCalResult?.createdEvent?.hangoutLink);

          if (googleHangoutLink) {
            results.push({
              ...googleMeetResult,
              success: true,
            });

            // Add google_meet to referencesToCreate in the same index as google_calendar
            updateManager.referencesToCreate[googleCalIndex] = {
              ...updateManager.referencesToCreate[googleCalIndex],
              meetingUrl: googleHangoutLink,
            };

            // Also create a new referenceToCreate with type video for google_meet
            updateManager.referencesToCreate.push({
              type: "google_meet_video",
              meetingUrl: googleHangoutLink,
              uid: googleCalResult.uid,
              credentialId: updateManager.referencesToCreate[googleCalIndex].credentialId,
            });
          } else if (googleCalResult && !googleHangoutLink) {
            results.push({
              ...googleMeetResult,
              success: false,
            });
          }
        }
        const createdOrUpdatedEvent = Array.isArray(results[0]?.updatedEvent)
          ? results[0]?.updatedEvent[0]
          : (results[0]?.updatedEvent ?? results[0]?.createdEvent);
        metadata.hangoutLink = createdOrUpdatedEvent?.hangoutLink;
        metadata.conferenceData = createdOrUpdatedEvent?.conferenceData;
        metadata.entryPoints = createdOrUpdatedEvent?.entryPoints;
        evt.appsStatus = handleAppsStatus(results, booking, reqAppsStatus);
        videoCallUrl =
          metadata.hangoutLink ||
          createdOrUpdatedEvent?.url ||
          organizerOrFirstDynamicGroupMemberDefaultLocationUrl ||
          getVideoCallUrlFromCalEvent(evt) ||
          videoCallUrl;
      }

      const calendarResult = results.find((result) => result.type.includes("_calendar"));

      evt.iCalUID = Array.isArray(calendarResult?.updatedEvent)
        ? calendarResult?.updatedEvent[0]?.iCalUID
        : calendarResult?.updatedEvent?.iCalUID || undefined;
    }

    evt.appsStatus = handleAppsStatus(results, booking, reqAppsStatus);

    if (!noEmail && isConfirmedByDefault && !isDryRun) {
      await emailsAndSmsHandler.send({
        action: BookingActionMap.rescheduled,
        data: {
          evt,
          eventType,
          additionalInformation: metadata,
          additionalNotes,
          iCalUID,
          originalRescheduledBooking,
          rescheduleReason,
          isRescheduledByBooker: reqBody.rescheduledBy === bookerEmail,
          users,
          changedOrganizer,
        },
      });
      bookingEmailsAndSmsTaskerAction = BookingActionMap.rescheduled;
    }
    // If it's not a reschedule, doesn't require confirmation and there's no price,
    // Create a booking
  } else if (isConfirmedByDefault) {
    const shouldSkipCalendarEvents = !areCalendarEventsEnabled || skipCalendarSyncTaskCreation;
    const createManager = await eventManager.create(evt, { skipCalendarEvent: shouldSkipCalendarEvents });
    if (evt.location) {
      booking.location = evt.location;
    }
    // This gets overridden when creating the event - to check if notes have been hidden or not. We just reset this back
    // to the default description when we are sending the emails.
    evt.description = eventType.description;

    results = createManager.results;
    referencesToCreate = createManager.referencesToCreate;
    videoCallUrl = evt.videoCallData?.url ? evt.videoCallData.url : null;

    if (results.length > 0 && results.every((res) => !res.success)) {
      const error = {
        errorCode: "BookingCreatingMeetingFailed",
        message: "Booking failed",
      };

      tracingLogger.error(
        `EventManager.create failure in some of the integrations ${organizerUser.username}`,
        safeStringify({ error, results })
      );
    } else {
      const additionalInformation: AdditionalInformation = {};

      if (results.length) {
        // Handle Google Meet results
        // We use the original booking location since the evt location changes to daily
        if (bookingLocation === MeetLocationType) {
          const googleMeetResult = {
            appName: GoogleMeetMetadata.name,
            type: "conferencing",
            uid: results[0].uid,
            originalEvent: results[0].originalEvent,
          };

          // Find index of google_calendar inside createManager.referencesToCreate
          const googleCalIndex = createManager.referencesToCreate.findIndex(
            (ref) => ref.type === "google_calendar"
          );
          const googleCalResult = results[googleCalIndex];

          if (!googleCalResult) {
            tracingLogger.warn("Google Calendar not installed but using Google Meet as location");
            results.push({
              ...googleMeetResult,
              success: false,
              calWarnings: [tOrganizer("google_meet_warning")],
            });
          }

          if (googleCalResult?.createdEvent?.hangoutLink) {
            results.push({
              ...googleMeetResult,
              success: true,
            });

            // Add google_meet to referencesToCreate in the same index as google_calendar
            createManager.referencesToCreate[googleCalIndex] = {
              ...createManager.referencesToCreate[googleCalIndex],
              meetingUrl: googleCalResult.createdEvent.hangoutLink,
            };

            // Also create a new referenceToCreate with type video for google_meet
            createManager.referencesToCreate.push({
              type: "google_meet_video",
              meetingUrl: googleCalResult.createdEvent.hangoutLink,
              uid: googleCalResult.uid,
              credentialId: createManager.referencesToCreate[googleCalIndex].credentialId,
            });
          } else if (googleCalResult && !googleCalResult.createdEvent?.hangoutLink) {
            results.push({
              ...googleMeetResult,
              success: false,
            });
          }
        }
        // TODO: Handle created event metadata more elegantly
        additionalInformation.hangoutLink = results[0].createdEvent?.hangoutLink;
        additionalInformation.conferenceData = results[0].createdEvent?.conferenceData;
        additionalInformation.entryPoints = results[0].createdEvent?.entryPoints;
        evt.appsStatus = handleAppsStatus(results, booking, reqAppsStatus);
        videoCallUrl =
          additionalInformation.hangoutLink ||
          organizerOrFirstDynamicGroupMemberDefaultLocationUrl ||
          videoCallUrl;

        if (!isDryRun && evt.iCalUID !== booking.iCalUID) {
          // The eventManager could change the iCalUID. At this point we can update the DB record
          await deps.prismaClient.booking.update({
            where: {
              id: booking.id,
            },
            data: {
              iCalUID: evt.iCalUID || booking.iCalUID,
            },
          });
        }
      }
      if (!noEmail) {
        if (!isDryRun && !(eventType.seatsPerTimeSlot && rescheduleUid)) {
          await emailsAndSmsHandler.send({
            action: BookingActionMap.confirmed,
            data: {
              eventType: {
                metadata: eventType.metadata,
                schedulingType: eventType.schedulingType,
              },
              eventNameObject,
              evt,
              additionalInformation,
              additionalNotes,
              customInputs,
            },
          });
          bookingEmailsAndSmsTaskerAction = BookingActionMap.confirmed;
        }
      }
    }
  } else {
    // If isConfirmedByDefault is false, then booking can't be considered ACCEPTED and thus EventManager has no role to play. Booking is created as PENDING
    tracingLogger.debug(
      `EventManager doesn't need to create or reschedule event for booking ${organizerUser.username}`,
      safeStringify({
        calEvent: getPiiFreeCalendarEvent(evt),
        isConfirmedByDefault,
        paymentValue: paymentAppData.price,
      })
    );
  }

  const bookingRequiresPayment =
    !Number.isNaN(paymentAppData.price) &&
    paymentAppData.price > 0 &&
    !originalRescheduledBooking?.paid &&
    !!booking;

  if (!isConfirmedByDefault && noEmail !== true && !bookingRequiresPayment) {
    tracingLogger.debug(
      `Emails: Booking ${organizerUser.username} requires confirmation, sending request emails`,
      safeStringify({
        calEvent: getPiiFreeCalendarEvent(evt),
      })
    );
    if (!isDryRun) {
      await emailsAndSmsHandler.send({
        action: BookingActionMap.requested,
        data: { evt, attendees: attendeesList, eventType, additionalNotes },
      });
      bookingEmailsAndSmsTaskerAction = BookingActionMap.requested;
    }
  }

  if (booking.location?.startsWith("http")) {
    videoCallUrl = booking.location;
  }

  const metadata = videoCallUrl
    ? {
        videoCallUrl: getVideoCallUrlFromCalEvent(evt) || videoCallUrl,
      }
    : undefined;

  const isBookingEmailSmsTaskerEnabled = false;

  await this.fireBookingEvents({
    booking: {
      ...booking,
      userEmail: booking.user?.email ?? null,
    },
    organizerUser,
    hashedLink: hasHashedBookingLink ? (reqBody.hashedLink ?? null) : null,
    isDryRun,
    bookerEmail,
    bookerName: fullName,
    originalRescheduledBooking,
    isRecurringBooking: !!input.bookingData.allRecurringDates,
    tracingLogger,
  });

  const webhookLocation = metadata?.videoCallUrl || evt.location;

  const webhookData: EventPayloadType = {
    ...evt,
    ...eventTypeInfo,
    bookingId: booking?.id,
    rescheduleId: originalRescheduledBooking?.id || undefined,
    rescheduleUid,
    rescheduleStartTime: originalRescheduledBooking?.startTime
      ? dayjs(originalRescheduledBooking?.startTime).utc().format()
      : undefined,
    rescheduleEndTime: originalRescheduledBooking?.endTime
      ? dayjs(originalRescheduledBooking?.endTime).utc().format()
      : undefined,
    metadata: { ...metadata, ...reqBody.metadata },
    eventTypeId,
    status: "ACCEPTED",
    smsReminderNumber: booking?.smsReminderNumber || undefined,
    rescheduledBy: reqBody.rescheduledBy,
    location: webhookLocation,
    ...(assignmentReason ? { assignmentReason: [assignmentReason] } : {}),
  };

  if (bookingRequiresPayment) {
    tracingLogger.debug(`Booking ${organizerUser.username} requires payment`);
    // Load credentials.app.categories
    const credentialPaymentAppCategories = await deps.prismaClient.credential.findMany({
      where: {
        ...(paymentAppData.credentialId ? { id: paymentAppData.credentialId } : { userId: organizerUser.id }),
        app: {
          categories: {
            hasSome: ["payment"],
          },
        },
      },
      select: {
        key: true,
        appId: true,
        app: {
          select: {
            categories: true,
            dirName: true,
          },
        },
      },
    });
    const eventTypePaymentAppCredential = credentialPaymentAppCategories.find((credential) => {
      return credential.appId === paymentAppData.appId;
    });

    if (!eventTypePaymentAppCredential) {
      throw new HttpError({
        statusCode: 400,
        message: "Missing payment credentials",
      });
    }

    // Convert type of eventTypePaymentAppCredential to appId: EventTypeAppList
    if (!booking.user) booking.user = organizerUser;
    const payment = await handlePayment({
      evt,
      selectedEventType: {
        ...eventType,
        metadata: eventType.metadata
          ? {
              ...eventType.metadata,
              apps: eventType.metadata?.apps as Prisma.JsonValue,
            }
          : {},
      },
      paymentAppCredentials: eventTypePaymentAppCredential as IEventTypePaymentCredentialType,
      booking,
      bookerName: fullName,
      bookerEmail,
      bookerPhoneNumber,
      isDryRun,
      bookingFields: eventType.bookingFields,
      locale: language,
    });
    const subscriberOptionsPaymentInitiated: GetSubscriberOptions = {
      userId: organizerUser.id,
      eventTypeId,
      triggerEvent: WebhookTriggerEvents.BOOKING_PAYMENT_INITIATED,
      teamId: null,
      orgId: null,
      oAuthClientId: platformClientId,
    };
    await handleWebhookTrigger({
      subscriberOptions: subscriberOptionsPaymentInitiated,
      eventTrigger: WebhookTriggerEvents.BOOKING_PAYMENT_INITIATED,
      webhookData: {
        ...webhookData,
        paymentId: payment?.id,
      },
      isDryRun,
      traceContext,
    });

    // TODO: Refactor better so this booking object is not passed
    // all around and instead the individual fields are sent as args.
    const bookingResponse = {
      ...booking,
      user: {
        ...booking.user,
        email: null,
      },
      videoCallUrl: metadata?.videoCallUrl,
      // Ensure seatReferenceUid is properly typed as string | null
      seatReferenceUid: evt.attendeeSeatId,
    };

    return {
      ...bookingResponse,
      ...luckyUserResponse,
      message: "Payment required",
      paymentRequired: true,
      paymentUid: payment?.uid,
      paymentId: payment?.id,
      isDryRun,
      ...(isDryRun ? { troubleshooterData } : {}),
      previousBooking: originalRescheduledBooking
        ? {
            uid: originalRescheduledBooking.uid,
            startTime: originalRescheduledBooking.startTime,
            endTime: originalRescheduledBooking.endTime,
          }
        : null,
    };
  }

  tracingLogger.debug(`Booking ${organizerUser.username} completed`);

  // We are here so, booking doesn't require payment and booking is also created in DB already, through createBooking call
  if (isConfirmedByDefault) {
    const subscribersMeetingEnded = await getWebhooks(subscriberOptionsMeetingEnded);
    const subscribersMeetingStarted = await getWebhooks(subscriberOptionsMeetingStarted);

    const deleteWebhookScheduledTriggerPromises: Promise<unknown>[] = [];
    const scheduleTriggerPromises = [];

    if (rescheduleUid && originalRescheduledBooking) {
      //delete all scheduled triggers for meeting ended and meeting started of booking
      deleteWebhookScheduledTriggerPromises.push(
        deleteWebhookScheduledTriggers({
          booking: originalRescheduledBooking,
          isDryRun,
        })
      );
      deleteWebhookScheduledTriggerPromises.push(
        cancelNoShowTasksForBooking({
          bookingUid: originalRescheduledBooking.uid,
        })
      );
    }

    if (booking && booking.status === BookingStatus.ACCEPTED) {
      const bookingWithCalEventResponses = {
        ...booking,
        responses: reqBody.calEventResponses,
      };
      for (const subscriber of subscribersMeetingEnded) {
        scheduleTriggerPromises.push(
          scheduleTrigger({
            booking: bookingWithCalEventResponses,
            subscriberUrl: subscriber.subscriberUrl,
            subscriber,
            triggerEvent: WebhookTriggerEvents.MEETING_ENDED,
            isDryRun,
          })
        );
      }

      for (const subscriber of subscribersMeetingStarted) {
        scheduleTriggerPromises.push(
          scheduleTrigger({
            booking: bookingWithCalEventResponses,
            subscriberUrl: subscriber.subscriberUrl,
            subscriber,
            triggerEvent: WebhookTriggerEvents.MEETING_STARTED,
            isDryRun,
          })
        );
      }
    }

    const scheduledTriggerResults = await Promise.allSettled([
      ...deleteWebhookScheduledTriggerPromises,
      ...scheduleTriggerPromises,
    ]);
    const failures = scheduledTriggerResults.filter((result) => result.status === "rejected");

    if (failures.length > 0) {
      tracingLogger.error(
        "Error while scheduling or canceling webhook triggers",
        safeStringify({
          errors: failures.map((f) => f.reason),
        })
      );
    }

    // Send Webhook call if hooked to BOOKING_CREATED & BOOKING_RESCHEDULED
    await handleWebhookTrigger({
      subscriberOptions,
      eventTrigger,
      webhookData,
      isDryRun,
      traceContext,
    });
  }

  if (!booking) throw new HttpError({ statusCode: 400, message: "Booking failed" });

  try {
    if (!isDryRun) {
      await deps.prismaClient.booking.update({
        where: {
          uid: booking.uid,
        },
        data: {
          location: evt.location,
          metadata: { ...(typeof booking.metadata === "object" && booking.metadata), ...metadata },
          references: {
            createMany: {
              data: referencesToCreate,
            },
          },
        },
      });
    }
  } catch (error) {
    tracingLogger.error("Error while creating booking references", JSON.stringify({ error }));
  }

  // Queue BOOKING_REQUESTED webhook after booking update so consumer fetches booking with location, metadata, references
  if (booking && booking.status === BookingStatus.PENDING && !isDryRun) {
    try {
      await deps.webhookProducer.queueBookingRequestedWebhook({
        bookingUid: booking.uid,
        userId: subscriberOptions.userId ?? undefined,
        eventTypeId: subscriberOptions.eventTypeId ?? undefined,
        teamId: Array.isArray(subscriberOptions.teamId)
          ? subscriberOptions.teamId[0]
          : (subscriberOptions.teamId ?? undefined),
        orgId: subscriberOptions.orgId ?? undefined,
        oAuthClientId: platformClientId ?? undefined,
      });
    } catch (webhookError) {
      tracingLogger.error(
        `Error queueing BOOKING_REQUESTED webhook: bookingId: ${booking.id}, bookingUid: ${booking.uid}`,
        safeStringify(webhookError)
      );
    }
  }

  const evtWithMetadata = {
    ...evt,
    rescheduleReason,
    metadata,
    eventType: { slug: eventType.slug, schedulingType: eventType.schedulingType, hosts: eventType.hosts },
    bookerUrl,
  };

  try {
    if (isConfirmedByDefault) {
      await scheduleNoShowTriggers({
        booking: {
          startTime: booking.startTime,
          id: booking.id,
          location: booking.location,
          uid: booking.uid,
        },
        triggerForUser: true,
        organizerUser: { id: organizerUser.id },
        eventTypeId,
        teamId: null,
        orgId: null,
        isDryRun,
      });
    }
  } catch (error) {
    tracingLogger.error("Error while scheduling no show triggers", JSON.stringify({ error }));
  }

  if (!isDryRun) {
    await handleAnalyticsEvents({
      credentials: allCredentials,
      rawBookingData,
      bookingInfo: {
        name: fullName,
        email: bookerEmail,
        eventName: "Cal.diy lead",
      },
      isTeamEventType,
    });

    // Unused until we deploy to trigger.dev production
    // for now we only enable for cal.com org and we keep our current email system
    // cal.com org members will see emails in double while we test
    if (ENABLE_ASYNC_TASKER && !noEmail && isBookingEmailSmsTaskerEnabled) {
      try {
        await deps.bookingEmailAndSmsTasker.send({
          action: bookingEmailsAndSmsTaskerAction,
          schedulingType: evtWithMetadata.eventType.schedulingType,
          payload: {
            bookingId: booking.id,
            conferenceCredentialId,
            platformClientId,
            platformRescheduleUrl,
            platformCancelUrl,
            platformBookingUrl,
            isRescheduledByBooker: reqBody.rescheduledBy === bookerEmail,
          },
        });
      } catch (err) {
        tracingLogger.error("bookingEmailAndSmsTasker error:", err);
      }
    }
  }

  // TODO: Refactor better so this booking object is not passed
  // all around and instead the individual fields are sent as args.
  const bookingResponse = {
    ...booking,
    user: {
      ...booking.user,
      email: null,
    },
    paymentRequired: false,
  };

  return {
    ...bookingResponse,
    ...luckyUserResponse,
    isDryRun,
    ...(isDryRun ? { troubleshooterData } : {}),
    references: referencesToCreate,
    seatReferenceUid: evt.attendeeSeatId,
    videoCallUrl: metadata?.videoCallUrl,
    previousBooking: originalRescheduledBooking
      ? {
          uid: originalRescheduledBooking.uid,
          startTime: originalRescheduledBooking.startTime,
          endTime: originalRescheduledBooking.endTime,
        }
      : null,
  };
}
```

<a id="finding-repository-health-complexity-getpublicevent-9e25ddc38c"></a>
## Critical complexity in getPublicEvent

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/eventtypes/lib/getPublicEvent.ts:284 has cyclomatic complexity 46, cognitive complexity 54, and maintainability 12.6.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-getpublicevent-9e25ddc38c"></a>
### Autofix

packages/features/eventtypes/lib/getPublicEvent.ts L282-L605

Source: packages/features/eventtypes/lib/getPublicEvent.ts L282-L605

```typescript

// TODO: Convert it to accept a single parameter with structured data
export const getPublicEvent = async (
  username: string,
  eventSlug: string,
  isTeamEvent: boolean | undefined,
  org: string | null,
  prisma: PrismaClient,
  fromRedirectOfNonOrgLink: boolean,
  currentUserId?: number,
  fetchAllUsers = false
) => {
  const usernameList = getUsernameList(username);
  const orgQuery = org ? getSlugOrRequestedSlug(org) : null;
  // In case of dynamic group event, we fetch user's data and use the default event.
  if (usernameList.length > 1) {
    const usersInOrgContext = await new UserRepository(prisma).findUsersByUsername({
      usernameList,
      orgSlug: org,
    });
    const users = usersInOrgContext;

    const defaultEvent = getDefaultEvent(eventSlug);
    let locations = defaultEvent.locations ? (defaultEvent.locations as LocationObject[]) : [];

    // Get the preferred location type from the first user
    const firstUsersMetadata = userMetadataSchema.parse(users[0].metadata || {});
    const preferedLocationType = firstUsersMetadata?.defaultConferencingApp;

    if (preferedLocationType?.appSlug) {
      const foundApp = getAppFromSlug(preferedLocationType.appSlug);
      const appType = foundApp?.appData?.location?.type;
      if (appType) {
        // Replace the location with the preferred location type
        // This will still be default to daily if the app is not found
        locations = [{ type: appType, link: preferedLocationType.appLink }] as LocationObject[];
      }
    }

    const defaultEventBookerLayouts = {
      enabledLayouts: [...bookerLayoutOptions],
      defaultLayout: BookerLayouts.MONTH_VIEW,
    } as BookerLayoutSettings;
    const disableBookingTitle = !defaultEvent.isDynamic;
    const unPublishedOrgUser = users.find((user) => user.profile?.organization?.slug === null);

    let orgDetails: Pick<Team, "logoUrl" | "name"> | undefined;
    if (org) {
      orgDetails = await prisma.team.findFirstOrThrow({
        where: {
          slug: org,
        },
        select: {
          logoUrl: true,
          name: true,
        },
      });
    }

    return {
      ...defaultEvent,
      bookingFields: getBookingFieldsWithSystemFields({ ...defaultEvent, disableBookingTitle }),
      // Only return fields consumed by the booker.
      subsetOfUsers: users.map((user) => ({
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        weekStart: user.weekStart,
        brandColor: user.brandColor,
        darkBrandColor: user.darkBrandColor,
        profile: user.profile,
        bookerUrl: getBookerBaseUrlSync(user.profile?.organization?.slug ?? null),
      })),
      users: fetchAllUsers
        ? users.map((user) => ({
            name: user.name,
            username: user.username,
            avatarUrl: user.avatarUrl,
            weekStart: user.weekStart,
            brandColor: user.brandColor,
            darkBrandColor: user.darkBrandColor,
            profile: user.profile,
            bookerUrl: getBookerBaseUrlSync(user.profile?.organization?.slug ?? null),
          }))
        : undefined,
      locations: privacyFilteredLocations(locations),
      profile: {
        weekStart: users[0].weekStart,
        brandColor: users[0].brandColor,
        darkBrandColor: users[0].darkBrandColor,
        theme: null,
        bookerLayouts: bookerLayoutsSchema.parse(
          firstUsersMetadata?.defaultBookerLayouts || defaultEventBookerLayouts
        ),
        ...(orgDetails
          ? {
              image: getPlaceholderAvatar(orgDetails?.logoUrl, orgDetails?.name),
              name: orgDetails?.name,
              username: org,
            }
          : {}),
      },
      entity: {
        considerUnpublished: !fromRedirectOfNonOrgLink && unPublishedOrgUser !== undefined,
        fromRedirectOfNonOrgLink,
        orgSlug: org,
        name: unPublishedOrgUser?.profile?.organization?.name ?? null,
        teamSlug: null,
        logoUrl: null,
        hideProfileLink: false,
      },
      isInstantEvent: false,
      instantMeetingParameters: [],
      showInstantEventConnectNowModal: false,
      autoTranslateDescriptionEnabled: false,
      fieldTranslations: [],
    };
  }

  const usersOrTeamQuery = isTeamEvent
    ? {
        team: {
          ...getSlugOrRequestedSlug(username),
          parent: orgQuery,
        },
      }
    : {
        users: {
          some: {
            ...(orgQuery
              ? {
                  profiles: {
                    some: {
                      organization: orgQuery,
                      username: username,
                    },
                  },
                }
              : {
                  username,
                  profiles: { none: {} },
                }),
          },
        },
        team: null,
      };

  // In case it's not a group event, it's either a single user or a team, and we query that data.
  let event = await prisma.eventType.findFirst({
    where: {
      slug: eventSlug,
      ...usersOrTeamQuery,
    },
    select: getPublicEventSelect(fetchAllUsers),
  });

  // If no event was found, check for platform org user event
  if (!event && !orgQuery) {
    event = await prisma.eventType.findFirst({
      where: {
        slug: eventSlug,
        users: {
          some: {
            username,
            isPlatformManaged: false,
            profiles: {
              some: {
                organization: {
                  isPlatform: true,
                },
              },
            },
          },
        },
      },
      select: getPublicEventSelect(fetchAllUsers),
    });
  }

  if (!event) return null;

  const eventMetaData = eventTypeMetaDataSchemaWithTypedApps.parse(event.metadata || {});
  const teamMetadata = teamMetadataSchema.parse(event.team?.metadata || {});
  const usersAsHosts = event.hosts.map((host) => host.user);

  // Enrich users in a single batch call
  const enrichedUsers = await new UserRepository(prisma).enrichUsersWithTheirProfiles(usersAsHosts);

  // Map enriched users back to the hosts
  const hosts = event.hosts.map((host, index) => ({
    ...host,
    user: enrichedUsers[index],
  }));

  const eventWithUserProfiles = {
    ...event,
    owner: event.owner
      ? await new UserRepository(prisma).enrichUserWithItsProfile({
          user: event.owner,
        })
      : null,
    subsetOfHosts: hosts,
    hosts: fetchAllUsers ? hosts : undefined,
  };

  let users =
    (await getUsersFromEvent(eventWithUserProfiles, prisma)) ||
    (await getOwnerFromUsersArray(prisma, event.id));

  if (users === null) {
    throw new Error(`EventType ${event.id} has no owner or users.`);
  }
  //In case the event schedule is not defined ,use the event owner's default schedule
  if (!eventWithUserProfiles.schedule && eventWithUserProfiles.owner?.defaultScheduleId) {
    const eventOwnerDefaultSchedule = await prisma.schedule.findUnique({
      where: {
        id: eventWithUserProfiles.owner?.defaultScheduleId,
      },
      select: {
        id: true,
        timeZone: true,
      },
    });
    eventWithUserProfiles.schedule = eventOwnerDefaultSchedule;
  }

  let orgDetails: Pick<Team, "logoUrl" | "name"> | undefined | null;
  if (org) {
    orgDetails = await prisma.team.findFirst({
      where: {
        slug: org,
        parentId: null,
      },
      select: {
        logoUrl: true,
        name: true,
      },
    });
  }

  let showInstantEventConnectNowModal = eventWithUserProfiles.isInstantEvent;

  if (eventWithUserProfiles.isInstantEvent && eventWithUserProfiles.instantMeetingSchedule?.id) {
    const { id, timeZone } = eventWithUserProfiles.instantMeetingSchedule;

    showInstantEventConnectNowModal = await isCurrentlyAvailable({
      prisma,
      instantMeetingScheduleId: id,
      availabilityTimezone: timeZone ?? "Europe/London",
      length: eventWithUserProfiles.length,
    });
  }
  let canViewPrivateTeamMembers = false;
  if (currentUserId && event.teamId) {
    const permissionCheckService = new PermissionCheckService();
    canViewPrivateTeamMembers = await permissionCheckService.checkPermission({
      userId: currentUserId,
      teamId: event.teamId,
      permission: "team.read",
      fallbackRoles: [MembershipRole.ADMIN, MembershipRole.OWNER],
    });

    if (!canViewPrivateTeamMembers && event.team?.parentId) {
      canViewPrivateTeamMembers = await permissionCheckService.checkPermission({
        userId: currentUserId,
        teamId: event.team.parentId,
        permission: "team.read",
        fallbackRoles: [MembershipRole.ADMIN, MembershipRole.OWNER],
      });
    }
  }

  if (event.team?.isPrivate && !canViewPrivateTeamMembers) {
    users = [];
  }

  return {
    ...eventWithUserProfiles,
    bookerLayouts: bookerLayoutsSchema.parse(eventMetaData?.bookerLayouts || null),
    description: markdownToSafeHTML(eventWithUserProfiles.description),
    metadata: eventMetaData,
    customInputs: customInputSchema.array().parse(event.customInputs || []),
    locations: privacyFilteredLocations((eventWithUserProfiles.locations || []) as LocationObject[]),
    bookingFields: getBookingFieldsWithSystemFields(event),
    recurringEvent: isRecurringEvent(eventWithUserProfiles.recurringEvent)
      ? parseRecurringEvent(event.recurringEvent)
      : null,
    // Sets user data on profile object for easier access
    profile: getProfileFromEvent(eventWithUserProfiles),
    subsetOfUsers: users,
    users: fetchAllUsers ? users : undefined,
    entity: {
      fromRedirectOfNonOrgLink,
      considerUnpublished:
        !fromRedirectOfNonOrgLink &&
        (eventWithUserProfiles.team?.slug === null ||
          eventWithUserProfiles.owner?.profile?.organization?.slug === null ||
          eventWithUserProfiles.team?.parent?.slug === null),
      orgSlug: org,
      teamSlug: (eventWithUserProfiles.team?.slug || teamMetadata?.requestedSlug) ?? null,
      name:
        (eventWithUserProfiles.owner?.profile?.organization?.name ||
          eventWithUserProfiles.team?.parent?.name ||
          eventWithUserProfiles.team?.name) ??
        null,
      hideProfileLink: eventWithUserProfiles.team?.hideTeamProfileLink ?? false,
      ...(orgDetails
        ? {
            logoUrl: getPlaceholderAvatar(orgDetails?.logoUrl, orgDetails?.name),
            name: orgDetails?.name,
          }
        : {}),
    },
    isDynamic: false,
    isInstantEvent: eventWithUserProfiles.isInstantEvent,
    showInstantEventConnectNowModal,
    instantMeetingParameters: eventWithUserProfiles.instantMeetingParameters,
    assignAllTeamMembers: event.assignAllTeamMembers,
    disableCancelling: event.disableCancelling,
    disableRescheduling: event.disableRescheduling,
    allowReschedulingCancelledBookings: event.allowReschedulingCancelledBookings,
    interfaceLanguage: event.interfaceLanguage,
  };
};
```

<a id="finding-repository-health-complexity-authenticate-5818168e65"></a>
## Critical complexity in authenticate

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

apps/api/v2/src/modules/auth/strategies/api-auth/api-auth.strategy.ts:55 has cyclomatic complexity 42, cognitive complexity 60, and maintainability 27.12.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-authenticate-5818168e65"></a>
### Autofix

apps/api/v2/src/modules/auth/strategies/api-auth/api-auth.strategy.ts L53-L152

Source: apps/api/v2/src/modules/auth/strategies/api-auth/api-auth.strategy.ts L53-L152

```typescript
  }

  async authenticate(request: ApiAuthGuardRequest) {
    try {
      const { params } = request;
      const oAuthClientSecret = request.get(X_CAL_SECRET_KEY);
      const oAuthClientId = params.clientId || request.get(X_CAL_CLIENT_ID);
      const bearerToken = request.get("Authorization")?.replace("Bearer ", "");

      const allowedMethods = request.allowedAuthMethods;
      const noSpecificAuthExpected = !allowedMethods || !allowedMethods.length;

      const oAuthAllowed = noSpecificAuthExpected || allowedMethods.includes("OAUTH_CLIENT_CREDENTIALS");
      const apiKeyAllowed = noSpecificAuthExpected || allowedMethods.includes("API_KEY");
      const accessTokenAllowed = noSpecificAuthExpected || allowedMethods.includes("ACCESS_TOKEN");
      const nextAuthAllowed = noSpecificAuthExpected || allowedMethods.includes("NEXT_AUTH");
      const thirdPartyAccessTokenAllowed =
        noSpecificAuthExpected || allowedMethods.includes("THIRD_PARTY_ACCESS_TOKEN");

      if (oAuthClientId && oAuthClientSecret && oAuthAllowed) {
        request.authMethod = AuthMethods["OAUTH_CLIENT"];
        return await this.authenticateOAuthClient(oAuthClientId, oAuthClientSecret, request);
      }

      if (bearerToken) {
        if (!apiKeyAllowed && !accessTokenAllowed && thirdPartyAccessTokenAllowed) {
          request.authMethod = AuthMethods["THIRD_PARTY_ACCESS_TOKEN"];
          const result = await this.validateThirdPartyAccessToken(bearerToken, request);
          if (result.success) {
            return this.success(this.getSuccessUser(result.data));
          }
        }

        if (apiKeyAllowed || accessTokenAllowed) {
          try {
            const requestOrigin = request.get("Origin");
            request.authMethod = isApiKey(bearerToken, this.config.get<string>("api.apiKeyPrefix") ?? "cal_")
              ? AuthMethods["API_KEY"]
              : AuthMethods["ACCESS_TOKEN"];
            return await this.authenticateBearerToken(bearerToken, request, requestOrigin);
          } catch (err) {
            // failed to validate access token, try to validate third party token
            if (thirdPartyAccessTokenAllowed && request.authMethod === AuthMethods["ACCESS_TOKEN"]) {
              request.authMethod = AuthMethods["THIRD_PARTY_ACCESS_TOKEN"];
              const result = await this.validateThirdPartyAccessToken(bearerToken, request);

              if (result.success) {
                return this.success(this.getSuccessUser(result.data));
              }
            }
            // token was not third party token, rethrow error from authenticateBearerToken
            if (err instanceof Error) {
              return this.error(err);
            }
          }
        }

        throw new UnauthorizedException(`ApiAuthStrategy - Invalid Bearer token`);
      }

      const nextAuthSecret = this.config.get("next.authSecret", { infer: true });
      const nextAuthToken = await getToken({ req: request, secret: nextAuthSecret });
      if (nextAuthToken && nextAuthAllowed) {
        request.authMethod = AuthMethods["NEXT_AUTH"];
        return await this.authenticateNextAuth(nextAuthToken, request);
      }

      const noAuthProvided = !oAuthClientId && !oAuthClientSecret && !bearerToken && !nextAuthToken;
      const onlyClientIdProvided = !!oAuthClientId && !oAuthClientSecret && !bearerToken && !nextAuthToken;
      const onlyClientSecretProvided =
        !oAuthClientId && !!oAuthClientSecret && !bearerToken && !nextAuthToken;

      if (noAuthProvided) {
        throw new UnauthorizedException(`ApiAuthStrategy - ${NO_AUTH_PROVIDED_MESSAGE}`);
      }

      if (onlyClientIdProvided) {
        throw new UnauthorizedException(`ApiAuthStrategy - ${ONLY_CLIENT_ID_PROVIDED_MESSAGE}`);
      }

      if (onlyClientSecretProvided) {
        throw new UnauthorizedException(`ApiAuthStrategy - ${ONLY_CLIENT_SECRET_PROVIDED_MESSAGE}`);
      }

      throw new UnauthorizedException(
        `ApiAuthStrategy - Invalid authentication method. Please provide one of the allowed methods: ${
          allowedMethods && allowedMethods.length > 0 ? allowedMethods.join(", ") : "Any supported method"
        }`
      );
    } catch (err) {
      if (err instanceof Error) {
        return this.error(err);
      }
      return this.error(
        new InternalServerErrorException(
          "ApiAuthStrategy - An error occurred while authenticating the request"
        )
      );
    }
  }
```

<a id="finding-repository-health-complexity-main-442cd69960"></a>
## Critical complexity in main

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

scripts/seed-app-store.ts:94 has cyclomatic complexity 42, cognitive complexity 43, and maintainability 19.88.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-main-442cd69960"></a>
### Autofix

scripts/seed-app-store.ts L92-L263

Source: scripts/seed-app-store.ts L92-L263

```typescript
}

export default async function main() {
  // Calendar apps
  await createApp("apple-calendar", "applecalendar", ["calendar"], "apple_calendar");
  if (
    process.env.BASECAMP3_CLIENT_ID &&
    process.env.BASECAMP3_CLIENT_SECRET &&
    process.env.BASECAMP3_USER_AGENT
  ) {
    await createApp("basecamp3", "basecamp3", ["other"], "basecamp3_other", {
      client_id: process.env.BASECAMP3_CLIENT_ID,
      client_secret: process.env.BASECAMP3_CLIENT_SECRET,
      user_agent: process.env.BASECAMP3_USER_AGENT,
    });
  }
  await createApp("caldav-calendar", "caldavcalendar", ["calendar"], "caldav_calendar");
  try {
    const { client_secret, client_id, redirect_uris } = JSON.parse(
      process.env.GOOGLE_API_CREDENTIALS || ""
    ).web;
    await createApp("google-calendar", "googlecalendar", ["calendar"], "google_calendar", {
      client_id,
      client_secret,
      redirect_uris,
    });
    await createApp("google-meet", "googlevideo", ["conferencing"], "google_video", {
      client_id,
      client_secret,
      redirect_uris,
    });
  } catch (e) {
    if (e instanceof Error) console.error("Error adding google credentials to DB:", e.message);
  }
  if (process.env.MS_GRAPH_CLIENT_ID && process.env.MS_GRAPH_CLIENT_SECRET) {
    await createApp("office365-calendar", "office365calendar", ["calendar"], "office365_calendar", {
      client_id: process.env.MS_GRAPH_CLIENT_ID,
      client_secret: process.env.MS_GRAPH_CLIENT_SECRET,
    });
    await createApp("msteams", "office365video", ["conferencing"], "office365_video", {
      client_id: process.env.MS_GRAPH_CLIENT_ID,
      client_secret: process.env.MS_GRAPH_CLIENT_SECRET,
    });
  }
  if (
    process.env.LARK_OPEN_APP_ID &&
    process.env.LARK_OPEN_APP_SECRET &&
    process.env.LARK_OPEN_VERIFICATION_TOKEN
  ) {
    await createApp("lark-calendar", "larkcalendar", ["calendar"], "lark_calendar", {
      app_id: process.env.LARK_OPEN_APP_ID,
      app_secret: process.env.LARK_OPEN_APP_SECRET,
      open_verification_token: process.env.LARK_OPEN_VERIFICATION_TOKEN,
    });
  }
  // Video apps
  if (process.env.DAILY_API_KEY) {
    await createApp("daily-video", "dailyvideo", ["conferencing"], "daily_video", {
      api_key: process.env.DAILY_API_KEY,
      scale_plan: process.env.DAILY_SCALE_PLAN,
    });
  }
  if (process.env.TANDEM_CLIENT_ID && process.env.TANDEM_CLIENT_SECRET) {
    await createApp("tandem", "tandemvideo", ["conferencing"], "tandem_video", {
      client_id: process.env.TANDEM_CLIENT_ID as string,
      client_secret: process.env.TANDEM_CLIENT_SECRET as string,
      base_url: (process.env.TANDEM_BASE_URL as string) || "https://tandem.chat",
    });
  }
  if (process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET) {
    await createApp("zoom", "zoomvideo", ["conferencing"], "zoom_video", {
      client_id: process.env.ZOOM_CLIENT_ID,
      client_secret: process.env.ZOOM_CLIENT_SECRET,
    });
  }
  await createApp("jitsi", "jitsivideo", ["conferencing"], "jitsi_video");
  // Other apps
  if (process.env.HUBSPOT_CLIENT_ID && process.env.HUBSPOT_CLIENT_SECRET) {
    await createApp("hubspot", "hubspot", ["crm"], "hubspot_other_calendar", {
      client_id: process.env.HUBSPOT_CLIENT_ID,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET,
    });
  }
  if (process.env.SALESFORCE_CONSUMER_KEY && process.env.SALESFORCE_CONSUMER_SECRET) {
    await createApp("salesforce", "salesforce", ["crm"], "salesforce_other_calendar", {
      consumer_key: process.env.SALESFORCE_CONSUMER_KEY,
      consumer_secret: process.env.SALESFORCE_CONSUMER_SECRET,
    });
  }
  if (process.env.ZOHOCRM_CLIENT_ID && process.env.ZOHOCRM_CLIENT_SECRET) {
    await createApp("zohocrm", "zohocrm", ["crm"], "zohocrm_other_calendar", {
      client_id: process.env.ZOHOCRM_CLIENT_ID,
      client_secret: process.env.ZOHOCRM_CLIENT_SECRET,
    });
  }

  await createApp("wipe-my-cal", "wipemycalother", ["automation"], "wipemycal_other");
  if (process.env.GIPHY_API_KEY) {
    await createApp("giphy", "giphy", ["other"], "giphy_other", {
      api_key: process.env.GIPHY_API_KEY,
    });
  }

  if (process.env.VITAL_API_KEY && process.env.VITAL_WEBHOOK_SECRET) {
    await createApp("vital-automation", "vital", ["automation"], "vital_other", {
      mode: process.env.VITAL_DEVELOPMENT_MODE || "sandbox",
      region: process.env.VITAL_REGION || "us",
      api_key: process.env.VITAL_API_KEY,
      webhook_secret: process.env.VITAL_WEBHOOK_SECRET,
    });
  }

  if (process.env.ZAPIER_INVITE_LINK) {
    await createApp("zapier", "zapier", ["automation"], "zapier_automation", {
      invite_link: process.env.ZAPIER_INVITE_LINK,
    });
  }
  await createApp("make", "make", ["automation"], "make_automation", {
    invite_link: "https://make.com/en/hq/app-invitation/6cb2772b61966508dd8f414ba3b44510",
  });

  if (process.env.HUDDLE01_API_TOKEN) {
    await createApp("huddle01", "huddle01video", ["conferencing"], "huddle01_video", {
      apiKey: process.env.HUDDLE01_API_TOKEN,
    });
  }

  // Payment apps
  if (
    process.env.STRIPE_CLIENT_ID &&
    process.env.STRIPE_PRIVATE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.PAYMENT_FEE_FIXED &&
    process.env.PAYMENT_FEE_PERCENTAGE
  ) {
    await createApp("stripe", "stripepayment", ["payment"], "stripe_payment", {
      client_id: process.env.STRIPE_CLIENT_ID,
      client_secret: process.env.STRIPE_PRIVATE_KEY,
      payment_fee_fixed: Number(process.env.PAYMENT_FEE_FIXED),
      payment_fee_percentage: Number(process.env.PAYMENT_FEE_PERCENTAGE),
      public_key: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    });
  }

  if (process.env.CLOSECOM_CLIENT_ID && process.env.CLOSECOM_CLIENT_SECRET) {
    await createApp("closecom", "closecom", ["crm"], "closecom_crm", {
      client_id: process.env.CLOSECOM_CLIENT_ID,
      client_secret: process.env.CLOSECOM_CLIENT_SECRET,
    });
  }

  for (const [, app] of Object.entries(appStoreMetadata)) {
    if (app.isTemplate && process.argv[2] !== "seed-templates") {
      continue;
    }

    const validatedCategories = app.categories.filter(
      (category): category is AppCategories => category in AppCategories
    );

    await createApp(
      app.slug,
      app.dirName ?? app.slug,
      validatedCategories,
      app.type,
      undefined,
      app.isTemplate
    );
  }
}
```

<a id="finding-repository-health-complexity-handler-ade03c41a4"></a>
## Critical complexity in handler

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

apps/web/app/api/auth/signup/handlers/selfHostedHandler.ts:24 has cyclomatic complexity 29, cognitive complexity 64, and maintainability 21.66.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-handler-ade03c41a4"></a>
### Autofix

apps/web/app/api/auth/signup/handlers/selfHostedHandler.ts L22-L209

Source: apps/web/app/api/auth/signup/handlers/selfHostedHandler.ts L22-L209

```typescript
import { NextResponse } from "next/server";

export default async function handler(body: Record<string, string>) {
  const { email, password, language, token } = signupSchema.parse(body);

  const username = slugify(body.username);
  const userEmail = email.toLowerCase();

  if (!username) {
    return NextResponse.json({ message: "Invalid username" }, { status: 422 });
  }

  let foundToken: { id: number; teamId: number | null; expires: Date } | null = null;
  let correctedUsername = username;
  if (token) {
    foundToken = await findTokenByToken({ token });
    throwIfTokenExpired(foundToken?.expires);
    correctedUsername = await validateAndGetCorrectedUsernameForTeam({
      username,
      email: userEmail,
      teamId: foundToken?.teamId,
      isSignup: true,
    });

    if (foundToken?.teamId) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { invitedTo: true },
      });
      if (existingUser && existingUser.invitedTo !== foundToken.teamId) {
        return NextResponse.json({ message: SIGNUP_ERROR_CODES.USER_ALREADY_EXISTS }, { status: 409 });
      }
    }
  } else {
    const userValidation = await validateAndGetCorrectedUsernameAndEmail({
      username,
      email: userEmail,
      isSignup: true,
    });
    if (!userValidation.isValid) {
      logger.error("User validation failed", { userValidation });
      return NextResponse.json({ message: "Username or email is already taken" }, { status: 409 });
    }
    if (!userValidation.username) {
      return NextResponse.json({ message: "Invalid username" }, { status: 422 });
    }
    correctedUsername = userValidation.username;
  }

  const hashedPassword = await hashPassword(password);

  if (foundToken?.teamId) {
    const team = await prisma.team.findUnique({
      where: {
        id: foundToken.teamId,
      },
      include: {
        parent: {
          select: {
            id: true,
            slug: true,
            organizationSettings: true,
          },
        },
        organizationSettings: true,
      },
    });

    if (team) {
      const isInviteForATeamInOrganization = !!team.parent;
      const isCheckingUsernameInGlobalNamespace = !team.isOrganization && !isInviteForATeamInOrganization;

      if (isCheckingUsernameInGlobalNamespace) {
        const isUsernameAvailable = !(await isUsernameReservedDueToMigration(correctedUsername));
        if (!isUsernameAvailable) {
          return NextResponse.json({ message: "A user exists with that username" }, { status: 409 });
        }
      }

      const organizationId = team.isOrganization ? team.id : (team.parent?.id ?? null);

      const existingUserByUsername = await prisma.user.findFirst({
        where: {
          username: correctedUsername,
          organizationId,
          NOT: { email: userEmail },
        },
        select: { id: true },
      });
      if (existingUserByUsername) {
        return NextResponse.json({ message: SIGNUP_ERROR_CODES.USER_ALREADY_EXISTS }, { status: 409 });
      }

      let user: { id: number };
      try {
        user = await prisma.user.upsert({
          where: { email: userEmail },
          update: {
            username: correctedUsername,
            emailVerified: new Date(Date.now()),
            identityProvider: IdentityProvider.CAL,
            password: {
              upsert: {
                create: { hash: hashedPassword },
                update: { hash: hashedPassword },
              },
            },
            organizationId,
          },
          create: {
            username: correctedUsername,
            email: userEmail,
            emailVerified: new Date(Date.now()),
            identityProvider: IdentityProvider.CAL,
            password: { create: { hash: hashedPassword } },
            organizationId,
          },
          select: { id: true },
        });
      } catch (error) {
        if (isPrismaError(error) && error.code === "P2002") {
          const target = String(error.meta?.target ?? "");
          if (target.includes("email") || target.includes("username")) {
            return NextResponse.json({ message: SIGNUP_ERROR_CODES.USER_ALREADY_EXISTS }, { status: 409 });
          }
        }
        throw error;
      }

      await createOrUpdateMemberships({
        user,
        team,
      });

      // Accept any child team invites for orgs.
      if (team.parent) {
        await joinAnyChildTeamOnOrgInvite({
          userId: user.id,
          org: team.parent,
        });
      }
    }

    // Cleanup token after use
    await prisma.verificationToken.delete({
      where: {
        id: foundToken.id,
      },
    });
  } else {
    const isUsernameAvailable = !(await isUsernameReservedDueToMigration(correctedUsername));
    if (!isUsernameAvailable) {
      return NextResponse.json({ message: "A user exists with that username" }, { status: 409 });
    }
    try {
      await prisma.user.create({
        data: {
          username: correctedUsername,
          email: userEmail,
          password: { create: { hash: hashedPassword } },
          identityProvider: IdentityProvider.CAL,
        },
        select: { id: true },
      });
    } catch (error) {
      // Fallback for race conditions where user was created between our check and create
      if (isPrismaError(error) && error.code === "P2002") {
        const target = String(error.meta?.target ?? "");
        if (target.includes("email") || target.includes("username")) {
          return NextResponse.json({ message: SIGNUP_ERROR_CODES.USER_ALREADY_EXISTS }, { status: 409 });
        }
      }
      throw error;
    }

    if (process.env.AVATARAPI_USERNAME && process.env.AVATARAPI_PASSWORD) {
      await prefillAvatar({ email: userEmail });
    }

    await sendEmailVerification({
      email: userEmail,
      username: correctedUsername,
      language,
    });
  }

  return NextResponse.json({ message: "Created user" }, { status: 201 });
}
```

<a id="finding-repository-health-complexity-getbaseproperties-7b639d0787"></a>
## Critical complexity in getBaseProperties

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/api-to-internal/booking-fields.ts:53 has cyclomatic complexity 28, cognitive complexity 37, and maintainability 20.9.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-getbaseproperties-7b639d0787"></a>
### Autofix

apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/api-to-internal/booking-fields.ts L51-L255

Source: apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/api-to-internal/booking-fields.ts L51-L255

```typescript
}

function getBaseProperties(field: InputBookingField): CustomField | SystemField {
  if (fieldIsSelect(field)) {
    return {
      name: field.slug,
      type: field.type,
      label: field.label,
      sources: [
        {
          id: "user",
          type: "user",
          label: "User",
          fieldRequired: true,
        },
      ],
      editable: "user",
      required: field.required,
      disableOnPrefill: !!field.disableOnPrefill,
      hidden: "hidden" in field ? field.hidden : false,
    };
  }

  if (fieldIsDefaultSystemLocation(field)) {
    return {
      ...systemBeforeFieldLocation,
      label: field.label,
    };
  }

  if (fieldIsDefaultAttendeePhone(field)) {
    return {
      ...systemBeforeFieldPhone,
      required: field.required,
      hidden: field.hidden,
      label: field.label,
      placeholder: field.placeholder,
      disableOnPrefill: !!field.disableOnPrefill,
    };
  }

  if (fieldIsCustomSystemName(field)) {
    const systemName = structuredClone(systemBeforeFieldName);
    if (systemName.variantsConfig?.variants?.fullName?.fields?.[0]) {
      systemName.variantsConfig.variants.fullName.fields[0].label = field.label;
    }

    if (systemName.variantsConfig?.variants?.fullName?.fields?.[0]) {
      systemName.variantsConfig.variants.fullName.fields[0].placeholder = field.placeholder;
    }
    // note(Lauris): we attach top level label and placeholder for easier access when converting database event type
    // to v2 response event type even though form builder uses label and placeholder from variantsConfig.
    systemName.label = field.label;
    systemName.placeholder = field.placeholder;

    return {
      ...systemName,
      disableOnPrefill: !!field.disableOnPrefill,
    };
  }

  if (fieldIsCustomSystemNameSplit(field)) {
    const systemNameSplit = structuredClone(systemBeforeFieldNameSplit);

    const firstNameField = systemNameSplit.variantsConfig?.variants?.firstAndLastName?.fields?.find(
      (field) => field.name === "firstName"
    );
    const lastNameField = systemNameSplit.variantsConfig?.variants?.firstAndLastName?.fields?.find(
      (field) => field.name === "lastName"
    );

    if (firstNameField) {
      firstNameField.label = field.firstNameLabel || "";
      firstNameField.placeholder = field.firstNamePlaceholder || "";
    }

    if (lastNameField) {
      lastNameField.label = field.lastNameLabel || "";
      lastNameField.placeholder = field.lastNamePlaceholder || "";
      lastNameField.required = !!field.lastNameRequired;
    }

    return {
      ...systemNameSplit,
      disableOnPrefill: !!field.disableOnPrefill,
    };
  }

  if (fieldIsCustomSystemEmail(field)) {
    return {
      ...systemBeforeFieldEmail,
      label: field.label,
      placeholder: field.placeholder,
      disableOnPrefill: !!field.disableOnPrefill,
      required: field.required,
      hidden: !!field.hidden,
    };
  }

  if (fieldIsCustomSystemRescheduleReason(field)) {
    return {
      ...systemAfterFieldRescheduleReason,
      required: !!field.required,
      hidden: !!field.hidden,
      label: field.label,
      placeholder: "placeholder" in field ? field.placeholder : undefined,
      disableOnPrefill: !!field.disableOnPrefill,
    };
  }

  if (fieldIsCustomSystemTitle(field)) {
    return {
      ...systemAfterFieldTitle,
      required: !!field.required,
      hidden: !!field.hidden,
      label: field.label,
      placeholder: "placeholder" in field ? field.placeholder : undefined,
      disableOnPrefill: !!field.disableOnPrefill,
    };
  }

  if (fieldIsCustomSystemNotes(field)) {
    return {
      ...systemAfterFieldNotes,
      required: !!field.required,
      hidden: !!field.hidden,
      label: field.label,
      placeholder: "placeholder" in field ? field.placeholder : undefined,
      disableOnPrefill: !!field.disableOnPrefill,
    };
  }

  if (fieldIsCustomSystemGuests(field)) {
    return {
      ...systemAfterFieldGuests,
      required: !!field.required,
      hidden: !!field.hidden,
      label: field.label,
      placeholder: "placeholder" in field ? field.placeholder : undefined,
      disableOnPrefill: !!field.disableOnPrefill,
    };
  }

  if (field.type === "boolean") {
    return {
      name: field.slug,
      type: field.type,
      label: field.label,
      labelAsSafeHtml: `<p>${field.label}</p>\n`,
      sources: [
        {
          id: "user",
          type: "user",
          label: "User",
          fieldRequired: true,
        },
      ],
      editable: "user",
      required: !!field.required,
      disableOnPrefill: !!field.disableOnPrefill,
      hidden: !!field.hidden,
    };
  }

  if (field.type === "url") {
    return {
      name: field.slug,
      type: field.type,
      label: field.label,
      placeholder: "placeholder" in field ? field.placeholder : "",
      labelAsSafeHtml: `<p>${field.label}</p>\n`,
      sources: [
        {
          id: "user",
          type: "user",
          label: "User",
          fieldRequired: true,
        },
      ],
      editable: "user",
      required: !!field.required,
      disableOnPrefill: !!field.disableOnPrefill,
      hidden: !!field.hidden,
    };
  }

  return {
    name: field.slug,
    type: field.type,
    label: "label" in field ? field.label : "",
    sources: [
      {
        id: "user",
        type: "user",
        label: "User",
        fieldRequired: true,
      },
    ],
    editable: "user",
    required: !!field.required,
    placeholder: field.placeholder,
    disableOnPrefill: !!field.disableOnPrefill,
    hidden: !!field.hidden,
  };
}
```

<a id="finding-repository-health-complexity-duplicatehandler-72a950591f"></a>
## Critical complexity in duplicateHandler

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/trpc/server/routers/viewer/eventTypes/heavy/duplicate.handler.ts:20 has cyclomatic complexity 25, cognitive complexity 31, and maintainability 21.52.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-duplicatehandler-72a950591f"></a>
### Autofix

packages/trpc/server/routers/viewer/eventTypes/heavy/duplicate.handler.ts L18-L233

Source: packages/trpc/server/routers/viewer/eventTypes/heavy/duplicate.handler.ts L18-L233

```typescript
};

export const duplicateHandler = async ({ ctx, input }: DuplicateOptions) => {
  try {
    const {
      id: originalEventTypeId,
      title: newEventTitle,
      slug: newSlug,
      description: newDescription,
      length: newLength,
    } = input;
    const eventType = await prisma.eventType.findUnique({
      where: {
        id: originalEventTypeId,
      },
      include: {
        customInputs: true,
        schedule: true,
        users: {
          select: {
            id: true,
          },
        },
        hosts: true,
        team: true,
        webhooks: true,
        hashedLink: true,
        destinationCalendar: true,
        calVideoSettings: {
          select: {
            disableRecordingForOrganizer: true,
            disableRecordingForGuests: true,
            enableAutomaticTranscription: true,
            enableAutomaticRecordingForOrganizer: true,
            requireEmailForGuests: true,
            redirectUrlOnExit: true,
            disableTranscriptionForGuests: true,
            disableTranscriptionForOrganizer: true,
          },
        },
      },
    });

    if (!eventType) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    // Validate user is owner of event type or in the team
    if (eventType.userId !== ctx.user.id) {
      if (eventType.teamId) {
        const isMember = await prisma.membership.findUnique({
          where: {
            userId_teamId: {
              userId: ctx.user.id,
              teamId: eventType.teamId,
            },
          },
        });
        if (!isMember) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }
    }

    const {
      customInputs,
      users,
      locations,
      team,
      hosts,
      recurringEvent,
      bookingLimits,
      durationLimits,
      eventTypeColor,
      customReplyToEmail,
      metadata,
      hashedLink,
      destinationCalendar,

      id: _id,

      webhooks: _webhooks,

      schedule: _schedule,
      // @ts-expect-error - descriptionAsSafeHTML is added on the fly using a prisma middleware it shouldn't be used to create event type. Such a property doesn't exist on schema
      descriptionAsSafeHTML: _descriptionAsSafeHTML,
      secondaryEmailId,
      instantMeetingScheduleId: _instantMeetingScheduleId,
      restrictionScheduleId: _restrictionScheduleId,
      calVideoSettings,
      ...rest
    } = eventType;

    const data: Prisma.EventTypeCreateInput = {
      ...rest,
      title: newEventTitle,
      slug: newSlug,
      description: newDescription,
      length: newLength,
      locations: locations ?? undefined,
      team: team ? { connect: { id: team.id } } : undefined,
      users: users ? { connect: users.map((user) => ({ id: user.id })) } : undefined,
      hosts: hosts
        ? {
            createMany: {
              data: hosts.map(({ eventTypeId: _, ...rest }) => rest),
            },
          }
        : undefined,
      restrictionSchedule: _restrictionScheduleId
        ? {
            connect: {
              id: _restrictionScheduleId,
            },
          }
        : undefined,
      recurringEvent: recurringEvent || undefined,
      bookingLimits: bookingLimits ?? undefined,
      durationLimits: durationLimits ?? undefined,
      eventTypeColor: eventTypeColor ?? undefined,
      customReplyToEmail: customReplyToEmail ?? undefined,
      metadata: metadata === null ? Prisma.DbNull : metadata,
      bookingFields: eventType.bookingFields === null ? Prisma.DbNull : eventType.bookingFields,
      rrSegmentQueryValue:
        eventType.rrSegmentQueryValue === null ? Prisma.DbNull : eventType.rrSegmentQueryValue,
      assignRRMembersUsingSegment: eventType.assignRRMembersUsingSegment,
    };

    // Validate the secondary email
    if (secondaryEmailId) {
      const secondaryEmail = await prisma.secondaryEmail.findUnique({
        where: {
          id: secondaryEmailId,
          userId: ctx.user.id,
        },
      });
      // Make sure the secondary email id belongs to the current user and its a verified one
      if (secondaryEmail && secondaryEmail.emailVerified) {
        data.secondaryEmail = {
          connect: {
            id: secondaryEmailId,
          },
        };
      }
    }

    const eventTypeRepo = new EventTypeRepository(prisma);
    const newEventType = await eventTypeRepo.create(data);

    // Create custom inputs
    if (customInputs) {
      const customInputsData = customInputs.map((customInput) => {
        const { id: _, options, ...rest } = customInput;
        return {
          options: options ?? undefined,
          ...rest,
          eventTypeId: newEventType.id,
        };
      });
      await prisma.eventTypeCustomInput.createMany({
        data: customInputsData,
      });
    }

    if (hashedLink.length > 0) {
      const newHashedLinksData = hashedLink.map((originalLink, index) => ({
        link: generateHashedLink(
          `${users[0]?.id ?? newEventType.teamId ?? originalLink.eventTypeId}-${index}`
        ),
        eventTypeId: newEventType.id,
        expiresAt: originalLink.expiresAt,
        maxUsageCount: originalLink.maxUsageCount,
      }));
      await prisma.hashedLink.createMany({
        data: newHashedLinksData,
      });
    }

    if (calVideoSettings) {
      await CalVideoSettingsRepository.createCalVideoSettings({
        eventTypeId: newEventType.id,
        calVideoSettings,
      });
    }

    if (destinationCalendar) {
      await setDestinationCalendarHandler({
        ctx,
        input: {
          ...destinationCalendar,
          eventTypeId: newEventType.id,
        },
      });
    }

    return {
      eventType: newEventType,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {

      if (Array.isArray(error.meta?.target) && error.meta?.target.includes("slug")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "duplicate_event_slug_conflict",
        });
      }

      throw new TRPCError({
        code: "CONFLICT",
        message: "Unique constraint violation while creating a duplicate event.",
      });
    }
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Error duplicating event type ${error}` });
  }
};
```

<a id="finding-repository-health-complexity-reschedule-52ce096021"></a>
## Critical complexity in reschedule

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/bookings/lib/EventManager.ts:615 has cyclomatic complexity 24, cognitive complexity 50, and maintainability 24.45.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-reschedule-52ce096021"></a>
### Autofix

packages/features/bookings/lib/EventManager.ts L613-L775

Source: packages/features/bookings/lib/EventManager.ts L613-L775

```typescript
   * @param event
   */
  public async reschedule(
    event: CalendarEvent,
    rescheduleUid: string,
    newBookingId?: number,
    changedOrganizer?: boolean,
    previousHostDestinationCalendar?: DestinationCalendar[] | null,
    isBookingRequestedReschedule?: boolean,
    skipDeleteEventsAndMeetings?: boolean
  ): Promise<CreateUpdateResult> {
    const originalEvt = processLocation(event);
    const evt = cloneDeep(originalEvt);
    if (!rescheduleUid) {
      throw new Error("You called eventManager.update without an `rescheduleUid`. This should never happen.");
    }

    // Get details of existing booking.
    const booking = await prisma.booking.findUnique({
      where: {
        uid: rescheduleUid,
      },
      select: {
        id: true,
        userId: true,
        attendees: true,
        location: true,
        endTime: true,
        references: {
          where: {
            deleted: null,
          },
          // NOTE: id field removed from select as we don't require for deletingMany
          // but was giving error on recreate for reschedule, probably because promise.all() didn't finished
          select: {
            type: true,
            uid: true,
            meetingId: true,
            meetingPassword: true,
            meetingUrl: true,
            externalCalendarId: true,
            credentialId: true,
          },
        },
        destinationCalendar: true,
        payment: true,
        eventType: {
          select: {
            seatsPerTimeSlot: true,
            seatsShowAttendees: true,
            seatsShowAvailabilityCount: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error("booking not found");
    }

    const results: Array<EventResult<Event>> = [];
    const updatedBookingReferences: Array<PartialReference> = [];
    const isLocationChanged = !!evt.location && !!booking.location && evt.location !== booking.location;

    let isDailyVideoRoomExpired = false;

    if (evt.location === "integrations:daily") {
      const originalBookingEndTime = new Date(booking.endTime);
      const roomExpiryTime = new Date(originalBookingEndTime.getTime() + 14 * 24 * 60 * 60 * 1000);
      const now = new Date();
      isDailyVideoRoomExpired = now > roomExpiryTime;
    }

    const shouldUpdateBookingReferences =
      !!changedOrganizer || isLocationChanged || !!isBookingRequestedReschedule || isDailyVideoRoomExpired;

    if (evt.requiresConfirmation) {
      if (!skipDeleteEventsAndMeetings) {
        log.debug("RescheduleRequiresConfirmation: Deleting Event and Meeting for previous booking");
        // As the reschedule requires confirmation, we can't update the events and meetings to new time yet. So, just delete them and let it be handled when organizer confirms the booking.
        await this.deleteEventsAndMeetings({
          event: {
            ...event,
            destinationCalendar: previousHostDestinationCalendar,
          },
          bookingReferences: booking.references,
        });
      } else {
        log.debug(
          "RescheduleRequiresConfirmation: Skipping deletion of Event and Meeting due to skipDeleteEventsAndMeetings flag"
        );
      }
    } else {
      if (changedOrganizer) {
        if (!skipDeleteEventsAndMeetings) {
          log.debug("RescheduleOrganizerChanged: Deleting Event and Meeting for previous booking");
          await this.deleteEventsAndMeetings({
            event: { ...event, destinationCalendar: previousHostDestinationCalendar },
            bookingReferences: booking.references,
          });
        }

        log.debug("RescheduleOrganizerChanged: Creating Event and Meeting for for new booking");
        const createdEvent = await this.create(originalEvt);
        results.push(...createdEvent.results);
        updatedBookingReferences.push(...createdEvent.referencesToCreate);
      } else {
        // If the reschedule doesn't require confirmation, we can "update" the events and meetings to new time.
        if (isLocationChanged || isBookingRequestedReschedule || isDailyVideoRoomExpired) {
          const updatedLocation = await this.updateLocation(evt, booking);
          results.push(...updatedLocation.results);
          updatedBookingReferences.push(...updatedLocation.referencesToCreate);
        } else {
          const isDedicated = evt.location ? isDedicatedIntegration(evt.location) : null;
          // If and only if event type is a dedicated meeting, update the dedicated video meeting.
          if (isDedicated) {
            const result = await this.updateVideoEvent(evt, booking);
            const [updatedEvent] = Array.isArray(result.updatedEvent)
              ? result.updatedEvent
              : [result.updatedEvent];

            if (updatedEvent) {
              evt.videoCallData = updatedEvent;
              evt.location = updatedEvent.url;
            }
            results.push(result);
          }

          const bookingCalendarReference = booking.references.find((reference) =>
            reference.type.includes("_calendar")
          );
          // There was a case that booking didn't had any reference and we don't want to throw error on function
          if (bookingCalendarReference) {
            // Update all calendar events.
            results.push(...(await this.updateAllCalendarEvents(evt, booking, newBookingId)));
          }
        }

        results.push(...(await this.updateAllCRMEvents(evt, booking)));
      }
    }
    const bookingPayment = booking?.payment;

    // Updating all payment to new
    if (bookingPayment && newBookingId) {
      const paymentIds = bookingPayment.map((payment) => payment.id);
      await prisma.payment.updateMany({
        where: {
          id: {
            in: paymentIds,
          },
        },
        data: {
          bookingId: newBookingId,
        },
      });
    }

    return {
      results,
      referencesToCreate: shouldUpdateBookingReferences ? updatedBookingReferences : [...booking.references],
    };
  }
```

<a id="finding-repository-health-complexity-main-93206e005a"></a>
## Critical complexity in main

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

scripts/seed.ts:634 has cyclomatic complexity 23, cognitive complexity 23, and maintainability 5.64.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-main-93206e005a"></a>
### Autofix

scripts/seed.ts L632-L1375

Source: scripts/seed.ts L632-L1375

```typescript
}

async function main() {
  await createUserAndEventType({
    user: {
      email: "delete-me@example.com",
      password: "delete-me",
      username: "delete-me",
      name: "delete-me",
    },
  });

  await createUserAndEventType({
    user: {
      email: "onboarding@example.com",
      password: "onboarding",
      username: "onboarding",
      name: "onboarding",
      completedOnboarding: false,
    },
  });

  await createUserAndEventType({
    user: {
      email: "free-first-hidden@example.com",
      password: "free-first-hidden",
      username: "free-first-hidden",
      name: "Free First Hidden Example",
    },
    eventTypes: [
      {
        title: "30min",
        slug: "30min",
        length: 30,
        hidden: true,
      },
      {
        title: "60min",
        slug: "60min",
        length: 30,
      },
    ],
  });

  await createUserAndEventType({
    user: {
      email: "pro@example.com",
      name: "Pro Example",
      password: "pro",
      username: "pro",
      theme: "light",
    },
    eventTypes: [
      {
        title: "30min",
        slug: "30min",
        length: 30,
        _bookings: [
          {
            uid: uuid(),
            title: "30min",
            startTime: dayjs().add(1, "day").toDate(),
            endTime: dayjs().add(1, "day").add(30, "minutes").toDate(),
          },
          {
            uid: uuid(),
            title: "30min",
            startTime: dayjs().add(2, "day").toDate(),
            endTime: dayjs().add(2, "day").add(30, "minutes").toDate(),
            status: BookingStatus.PENDING,
          },
          {
            // hardcode UID so that we can easily test rescheduling in embed
            uid: "qm3kwt3aTnVD7vmP9tiT2f",
            title: "30min Seeded Booking",
            startTime: dayjs().add(3, "day").toDate(),
            endTime: dayjs().add(3, "day").add(30, "minutes").toDate(),
            status: BookingStatus.PENDING,
          },
        ],
      },
      {
        title: "60min",
        slug: "60min",
        length: 60,
      },
      {
        title: "Multiple duration",
        slug: "multiple-duration",
        length: 75,
        metadata: {
          multipleDuration: [30, 75, 90],
        },
      },
      {
        title: "paid",
        slug: "paid",
        length: 60,
        price: 100,
      },
      {
        title: "In person meeting",
        slug: "in-person",
        length: 60,
        locations: [{ type: "inPerson", address: "London" }],
      },
      {
        title: "Zoom Event",
        slug: "zoom",
        length: 60,
        locations: [{ type: zoomMeta.appData?.location?.type }],
      },
      {
        title: "Daily Event",
        slug: "daily",
        length: 60,
        locations: [{ type: dailyMeta.appData?.location?.type }],
      },
      {
        title: "Google Meet",
        slug: "google-meet",
        length: 60,
        locations: [{ type: googleMeetMeta.appData?.location?.type }],
      },
      {
        title: "Yoga class",
        slug: "yoga-class",
        length: 30,
        recurringEvent: { freq: 2, count: 12, interval: 1 },
        _bookings: [
          {
            uid: uuid(),
            title: "Yoga class",
            recurringEventId: Buffer.from("yoga-class").toString("base64"),
            startTime: dayjs().add(1, "day").toDate(),
            endTime: dayjs().add(1, "day").add(30, "minutes").toDate(),
            status: BookingStatus.ACCEPTED,
          },
          {
            uid: uuid(),
            title: "Yoga class",
            recurringEventId: Buffer.from("yoga-class").toString("base64"),
            startTime: dayjs().add(1, "day").add(1, "week").toDate(),
            endTime: dayjs().add(1, "day").add(1, "week").add(30, "minutes").toDate(),
            status: BookingStatus.ACCEPTED,
          },
          {
            uid: uuid(),
            title: "Yoga class",
            recurringEventId: Buffer.from("yoga-class").toString("base64"),
            startTime: dayjs().add(1, "day").add(2, "week").toDate(),
            endTime: dayjs().add(1, "day").add(2, "week").add(30, "minutes").toDate(),
            status: BookingStatus.ACCEPTED,
          },
          {
            uid: uuid(),
            title: "Yoga class",
            recurringEventId: Buffer.from("yoga-class").toString("base64"),
            startTime: dayjs().add(1, "day").add(3, "week").toDate(),
            endTime: dayjs().add(1, "day").add(3, "week").add(30, "minutes").toDate(),
            status: BookingStatus.ACCEPTED,
          },
          {
            uid: uuid(),
            title: "Yoga class",
            recurringEventId: Buffer.from("yoga-class").toString("base64"),
            startTime: dayjs().add(1, "day").add(4, "week").toDate(),
            endTime: dayjs().add(1, "day").add(4, "week").add(30, "minutes").toDate(),
            status: BookingStatus.ACCEPTED,
          },
          {
            uid: uuid(),
            title: "Yoga class",
            recurringEventId: Buffer.from("yoga-class").toString("base64"),
            startTime: dayjs().add(1, "day").add(5, "week").toDate(),
            endTime: dayjs().add(1, "day").add(5, "week").add(30, "minutes").toDate(),
            status: BookingStatus.ACCEPTED,
          },
          {
            uid: uuid(),
            title: "Seeded Yoga class",
            description: "seeded",
            recurringEventId: Buffer.from("seeded-yoga-class").toString("base64"),
            startTime: dayjs().subtract(4, "day").toDate(),
            endTime: dayjs().subtract(4, "day").add(30, "minutes").toDate(),
            status: BookingStatus.ACCEPTED,
          },
          {
            uid: uuid(),
            title: "Seeded Yoga class",
            description: "seeded",
            recurringEventId: Buffer.from("seeded-yoga-class").toString("base64"),
            startTime: dayjs().subtract(4, "day").add(1, "week").toDate(),
            endTime: dayjs().subtract(4, "day").add(1, "week").add(30, "minutes").toDate(),
            status: BookingStatus.ACCEPTED,
          },
          {
            uid: uuid(),
            title: "Seeded Yoga class",
            description: "seeded",
            recurringEventId: Buffer.from("seeded-yoga-class").toString("base64"),
            startTime: dayjs().subtract(4, "day").add(2, "week").toDate(),
            endTime: dayjs().subtract(4, "day").add(2, "week").add(30, "minutes").toDate(),
            status: BookingStatus.ACCEPTED,
          },
          {
            uid: uuid(),
            title: "Seeded Yoga class",
            description: "seeded",
            recurringEventId: Buffer.from("seeded-yoga-class").toString("base64"),
            startTime: dayjs().subtract(4, "day").add(3, "week").toDate(),
            endTime: dayjs().subtract(4, "day").add(3, "week").add(30, "minutes").toDate(),
            status: BookingStatus.ACCEPTED,
          },
        ],
      },
      {
        title: "Tennis class",
        slug: "tennis-class",
        length: 60,
        recurringEvent: { freq: 2, count: 10, interval: 2 },
        requiresConfirmation: true,
        _bookings: [
          {
            uid: uuid(),
            title: "Tennis class",
            recurringEventId: Buffer.from("tennis-class").toString("base64"),
            startTime: dayjs().add(2, "day").toDate(),
            endTime: dayjs().add(2, "day").add(60, "minutes").toDate(),
            status: BookingStatus.PENDING,
          },
          {
            uid: uuid(),
            title: "Tennis class",
            recurringEventId: Buffer.from("tennis-class").toString("base64"),
            startTime: dayjs().add(2, "day").add(2, "week").toDate(),
            endTime: dayjs().add(2, "day").add(2, "week").add(60, "minutes").toDate(),
            status: BookingStatus.PENDING,
          },
          {
            uid: uuid(),
            title: "Tennis class",
            recurringEventId: Buffer.from("tennis-class").toString("base64"),
            startTime: dayjs().add(2, "day").add(4, "week").toDate(),
            endTime: dayjs().add(2, "day").add(4, "week").add(60, "minutes").toDate(),
            status: BookingStatus.PENDING,
          },
          {
            uid: uuid(),
            title: "Tennis class",
            recurringEventId: Buffer.from("tennis-class").toString("base64"),
            startTime: dayjs().add(2, "day").add(8, "week").toDate(),
            endTime: dayjs().add(2, "day").add(8, "week").add(60, "minutes").toDate(),
            status: BookingStatus.PENDING,
          },
          {
            uid: uuid(),
            title: "Tennis class",
            recurringEventId: Buffer.from("tennis-class").toString("base64"),
            startTime: dayjs().add(2, "day").add(10, "week").toDate(),
            endTime: dayjs().add(2, "day").add(10, "week").add(60, "minutes").toDate(),
            status: BookingStatus.PENDING,
          },
        ],
      },
    ],
  });

  await createUserAndEventType({
    user: {
      email: "trial@example.com",
      password: "trial",
      username: "trial",
      name: "Trial Example",
    },
    eventTypes: [
      {
        title: "30min",
        slug: "30min",
        length: 30,
      },
      {
        title: "60min",
        slug: "60min",
        length: 60,
      },
    ],
  });

  await createUserAndEventType({
    user: {
      email: "free@example.com",
      password: "free",
      username: "free",
      name: "Free Example",
    },
    eventTypes: [
      {
        title: "30min",
        slug: "30min",
        length: 30,
      },
      {
        title: "60min",
        slug: "60min",
        length: 30,
      },
    ],
  });

  await createUserAndEventType({
    user: {
      email: "usa@example.com",
      password: "usa",
      username: "usa",
      name: "USA Timezone Example",
      timeZone: "America/Phoenix",
    },
    eventTypes: [
      {
        title: "30min",
        slug: "30min",
        length: 30,
      },
    ],
  });

  const freeUserTeam = await createUserAndEventType({
    user: {
      email: "teamfree@example.com",
      password: "teamfree",
      username: "teamfree",
      name: "Team Free Example",
    },
  });

  const proUserTeam = await createUserAndEventType({
    user: {
      email: "teampro@example.com",
      password: "teampro",
      username: "teampro",
      name: "Team Pro Example",
    },
  });

  const pro2UserTeam = await createUserAndEventType({
    user: {
      email: "teampro2@example.com",
      password: "teampro2",
      username: "teampro2",
      name: "Team Pro Example 2",
    },
  });

  const pro3UserTeam = await createUserAndEventType({
    user: {
      email: "teampro3@example.com",
      password: "teampro3",
      username: "teampro3",
      name: "Team Pro Example 3",
    },
  });

  const pro4UserTeam = await createUserAndEventType({
    user: {
      email: "teampro4@example.com",
      password: "teampro4",
      username: "teampro4",
      name: "Team Pro Example 4",
    },
  });

  const admin = await createUserAndEventType({
    user: {
      email: "admin@example.com",
      /** To comply with admin password requirements  */
      password: "ADMINadmin2022!",
      username: "admin",
      name: "Admin Example",
      role: "ADMIN",
    },
  });

  const clientId = process.env.SEED_OAUTH2_CLIENT_ID;
  const clientSecret = process.env.SEED_OAUTH2_CLIENT_SECRET_HASHED;

  if (clientId && clientSecret) {
    await createOAuthClientForUser(admin.id, {
      clientId,
      clientSecret,
      name: "atoms examples app oauth 2 client",
      purpose: "test atoms examples app with oauth 2",
      redirectUri: "http://localhost:4321",
      websiteUrl: "http://localhost:4321",
      enablePkce: false,
    });
  }

  if (process.env.E2E_TEST_CALCOM_QA_EMAIL && process.env.E2E_TEST_CALCOM_QA_PASSWORD) {
    await createUserAndEventType({
      user: {
        email: process.env.E2E_TEST_CALCOM_QA_EMAIL || "qa@example.com",
        password: process.env.E2E_TEST_CALCOM_QA_PASSWORD || "qa",
        username: "qa",
        name: "QA Example",
      },
      eventTypes: [
        {
          title: "15min",
          slug: "15min",
          length: 15,
        },
      ],
      credentials: [
        process.env.E2E_TEST_CALCOM_QA_GCAL_CREDENTIALS
          ? {
              type: "google_calendar",
              key: JSON.parse(process.env.E2E_TEST_CALCOM_QA_GCAL_CREDENTIALS) as Prisma.JsonObject,
              appId: "google-calendar",
            }
          : null,
      ],
    });
  }

  await createTeamAndAddUsers(
    {
      name: "Seeded Team",
      slug: "seeded-team",
      eventTypes: {
        createMany: {
          data: [
            {
              title: "Collective Seeded Team Event",
              slug: "collective-seeded-team-event",
              length: 15,
              schedulingType: "COLLECTIVE",
            },
            {
              title: "Round Robin Seeded Team Event",
              slug: "round-robin-seeded-team-event",
              length: 15,
              schedulingType: "ROUND_ROBIN",
            },
          ],
        },
      },
      createdAt: new Date(),
    },
    [
      {
        id: proUserTeam.id,
        username: proUserTeam.name || "Unknown",
      },
      {
        id: freeUserTeam.id,
        username: freeUserTeam.name || "Unknown",
      },
      {
        id: pro2UserTeam.id,
        username: pro2UserTeam.name || "Unknown",
        role: "MEMBER",
      },
      {
        id: pro3UserTeam.id,
        username: pro3UserTeam.name || "Unknown",
      },
      {
        id: pro4UserTeam.id,
        username: pro4UserTeam.name || "Unknown",
      },
    ]
  );

  await createTeamAndAddUsers(
    {
      name: "Seeded Team (Marketing)",
      slug: "seeded-team-marketing",
      eventTypes: {
        createMany: {
          data: [
            {
              title: "Collective Seeded Team Event",
              slug: "collective-seeded-team-event",
              length: 15,
              schedulingType: "COLLECTIVE",
            },
            {
              title: "Round Robin Seeded Team Event",
              slug: "round-robin-seeded-team-event",
              length: 15,
              schedulingType: "ROUND_ROBIN",
            },
          ],
        },
      },
      createdAt: new Date(),
    },
    [
      {
        id: proUserTeam.id,
        username: proUserTeam.name || "Unknown",
      },
      {
        id: freeUserTeam.id,
        username: freeUserTeam.name || "Unknown",
      },
      {
        id: pro2UserTeam.id,
        username: pro2UserTeam.name || "Unknown",
        role: "MEMBER",
      },
      {
        id: pro3UserTeam.id,
        username: pro3UserTeam.name || "Unknown",
      },
      {
        id: pro4UserTeam.id,
        username: pro4UserTeam.name || "Unknown",
      },
    ]
  );

  await createTeamAndAddUsers(
    {
      name: "Seeded Team (Design)",
      slug: "seeded-team-design",
      eventTypes: {
        createMany: {
          data: [
            {
              title: "Collective Seeded Team Event",
              slug: "collective-seeded-team-event",
              length: 15,
              schedulingType: "COLLECTIVE",
            },
            {
              title: "Round Robin Seeded Team Event",
              slug: "round-robin-seeded-team-event",
              length: 15,
              schedulingType: "ROUND_ROBIN",
            },
          ],
        },
      },
      createdAt: new Date(),
    },
    [
      {
        id: proUserTeam.id,
        username: proUserTeam.name || "Unknown",
      },
      {
        id: freeUserTeam.id,
        username: freeUserTeam.name || "Unknown",
      },
      {
        id: pro2UserTeam.id,
        username: pro2UserTeam.name || "Unknown",
        role: "MEMBER",
      },
      {
        id: pro3UserTeam.id,
        username: pro3UserTeam.name || "Unknown",
      },
      {
        id: pro4UserTeam.id,
        username: pro4UserTeam.name || "Unknown",
      },
    ]
  );

  await createOrganizationAndAddMembersAndTeams({
    org: {
      orgData: {
        name: "Acme Inc",
        slug: "acme",
        isOrganization: true,
        organizationSettings: {
          isOrganizationVerified: true,
          orgAutoAcceptEmail: "acme.com",
          isAdminAPIEnabled: true,
          isAdminReviewed: true,
        },
      },
      members: [
        {
          memberData: {
            email: "owner1-acme@example.com",
            password: {
              create: {
                hash: "owner1-acme",
              },
            },
            username: "owner1-acme",
            name: "Owner 1",
          },
          orgMembership: {
            role: "OWNER",
            accepted: true,
          },
          orgProfile: {
            username: "owner1",
          },
          inTeams: [
            {
              slug: "team1",
              role: "ADMIN",
            },
          ],
        },
        ...Array.from({ length: 10 }, (_, i) => ({
          memberData: {
            email: `member${i}-acme@example.com`,
            password: {
              create: {
                hash: `member${i}-acme`,
              },
            },
            username: `member${i}-acme`,
            name: `Member ${i}`,
          },
          orgMembership: {
            role: MembershipRole.MEMBER,
            accepted: true,
          },
          orgProfile: {
            username: `member${i}`,
          },
          inTeams:
            i % 2 === 0
              ? [
                  {
                    slug: "team1",
                    role: MembershipRole.MEMBER,
                  },
                ]
              : [],
        })),
      ],
    },
    teams: [
      {
        teamData: {
          name: "Team 1",
          slug: "team1",
        },
        nonOrgMembers: [
          {
            email: "non-acme-member-1@example.com",
            password: {
              create: {
                hash: "non-acme-member-1",
              },
            },
            username: "non-acme-member-1",
            name: "NonAcme Member1",
          },
        ],
      },
    ],
    usersOutsideOrg: [
      {
        name: "Jane Doe",
        email: "jane@acme.com",
        username: "jane-outside-org",
      },
    ],
  });

  await createOrganizationAndAddMembersAndTeams({
    org: {
      orgData: {
        name: "Dunder Mifflin",
        slug: "dunder-mifflin",
        isOrganization: true,
        organizationSettings: {
          isOrganizationVerified: true,
          orgAutoAcceptEmail: "dunder-mifflin.com",
          isAdminReviewed: true,
        },
      },
      members: [
        {
          memberData: {
            email: "owner1-dunder@example.com",
            password: {
              create: {
                hash: "owner1-dunder",
              },
            },
            username: "owner1-dunder",
            name: "Owner 1",
          },
          orgMembership: {
            role: "OWNER",
            accepted: true,
          },
          orgProfile: {
            username: "owner1",
          },
          inTeams: [
            {
              slug: "team1",
              role: "ADMIN",
            },
          ],
        },
      ],
    },
    teams: [
      {
        teamData: {
          name: "Team 1",
          slug: "team1",
        },
        nonOrgMembers: [
          {
            email: "non-dunder-member-1@example.com",
            password: {
              create: {
                hash: "non-dunder-member-1",
              },
            },
            username: "non-dunder-member-1",
            name: "NonDunder Member1",
          },
        ],
      },
    ],
    usersOutsideOrg: [
      {
        name: "John Doe",
        email: "john@dunder-mifflin.com",
        username: "john-outside-org",
      },
    ],
  });

  // Routing forms feature removed - routing form seeding no longer needed

  await ensureAcmeOwnerHasApiKeySeeded();
  await seedPerHostLocationsInAcmeOrg();
}
```

<a id="finding-repository-health-complexity-createcrmevent-b2b25ec7db"></a>
## Critical complexity in createCRMEvent

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/tasker/tasks/crm/createCRMEvent.ts:41 has cyclomatic complexity 22, cognitive complexity 28, and maintainability 22.33.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-createcrmevent-b2b25ec7db"></a>
### Autofix

packages/features/tasker/tasks/crm/createCRMEvent.ts L39-L234

Source: packages/features/tasker/tasks/crm/createCRMEvent.ts L39-L234

```typescript
};

export async function createCRMEvent(payload: string): Promise<void> {
  // All errors thrown from this try catch will be cause a retry
  try {
    const parsedPayload = createCRMEventSchema.safeParse(JSON.parse(payload));

    if (!parsedPayload.success) {
      throw new Error(`malformed payload in createCRMEvent: ${parsedPayload.error}`);
    }
    const { bookingUid } = parsedPayload.data;

    const booking = await prisma.booking.findUnique({
      where: {
        uid: bookingUid,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            locale: true,
            username: true,
            timeZone: true,
          },
        },
        eventType: {
          select: {
            metadata: true,
          },
        },
        references: {
          select: {
            type: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error(`booking not found for uid: ${bookingUid}`);
    }

    if (booking.status !== BookingStatus.ACCEPTED) {
      log.info(`Booking status is not ACCEPTED`);
      return;
    }

    if (!booking.user) {
      throw new Error(`user not found for uid: ${bookingUid}`);
    }

    const eventTypeMetadata = EventTypeMetaDataSchema.safeParse(booking.eventType?.metadata);

    if (!eventTypeMetadata.success) {
      throw new Error(`malformed event type metadata: ${eventTypeMetadata.error}`);
    }

    const eventTypeAppMetadata = eventTypeMetadata.data?.apps;

    if (!eventTypeAppMetadata) {
      throw new Error(`event type app metadata not found for booking ${bookingUid}`);
    }

    const calendarEvent = await buildCalendarEvent(bookingUid);

    const bookingReferencesToCreate: Prisma.BookingReferenceUncheckedCreateInput[] = [];
    const existingBookingReferences = await prisma.bookingReference.findMany({
      where: {
        bookingId: booking.id,
        deleted: null,
      },
    });

    const errorPerApp: Record<AppSlug, UnknownError> = {};

    /** Common shape for parsed app data that may include CRM properties */
    interface ParsedAppData {
      appCategories?: string[];
      enabled?: boolean;
      credentialId?: number;
    }

    // Parse apps and collect credential IDs for enabled CRM apps
    const appInfoMap = new Map<string, { app: ParsedAppData; credentialId: number }>();
    const credentialIds = new Set<number>();

    for (const appSlug of Object.keys(eventTypeAppMetadata)) {
      const appData = eventTypeAppMetadata[appSlug as keyof typeof eventTypeAppMetadata];
      const appDataSchema = appDataSchemas[appSlug as keyof typeof appDataSchemas];

      if (!appData || !appDataSchema) {
        throw new Error(`Could not find appData or appDataSchema for ${appSlug}`);
      }

      const appParse = appDataSchema.safeParse(appData);

      if (!appParse.success) {
        log.error(`Error parsing event type app data for bookingUid ${bookingUid}`, appParse?.error);
        continue;
      }

      const app = appParse.data as ParsedAppData;
      const hasCrmCategory =
        app.appCategories && app.appCategories.some((category: string) => category === "crm");

      if (!app.enabled || !app.credentialId || !hasCrmCategory) {
        log.info(`Skipping CRM app ${appSlug}`, {
          enabled: app.enabled,
          credentialId: app.credentialId,
          hasCrmCategory,
        });
        continue;
      }

      appInfoMap.set(appSlug, { app, credentialId: app.credentialId });
      credentialIds.add(app.credentialId);
    }

    const crmCredentials = await prisma.credential.findMany({
      where: {
        id: {
          in: Array.from(credentialIds),
        },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    const crmCredentialMap = new Map<number, (typeof crmCredentials)[number]>();
    for (const credential of crmCredentials) {
      crmCredentialMap.set(credential.id, credential);
    }
    //Find enabled CRM apps for the event type
    for (const appSlug of Array.from(appInfoMap.keys())) {
      const { app, credentialId } = appInfoMap.get(appSlug)!;
      // Try Catch per app to ensure all apps are tried even if any of them throws an error
      // If we want to retry for an error from this try catch, then that error must be thrown as a RetryableError
      try {
        const crmCredential = crmCredentialMap.get(credentialId);

        if (!crmCredential) {
          throw new Error(`Credential not found for credentialId: ${credentialId}`);
        }

        const existingBookingReferenceForTheCredential = existingBookingReferences.find(
          (reference) => reference.credentialId === crmCredential.id
        );

        if (existingBookingReferenceForTheCredential) {
          log.info(`Skipping CRM app ${appSlug} as booking reference already exists`, {
            credentialId: crmCredential.id,
            bookingReferenceId: existingBookingReferenceForTheCredential.id,
          });
          continue;
        }

        const CrmManager = (await import("@calcom/features/crmManager/crmManager")).default;

        const crm = new CrmManager(crmCredential, app);

        const results = await crm.createEvent(calendarEvent);

        if (results) {
          bookingReferencesToCreate.push({
            type: crmCredential.type,
            uid: results.id,
            meetingId: results.id,
            credentialId: crmCredential.id,
            bookingId: booking.id,
          });
        }
      } catch (error) {
        errorPerApp[appSlug] = error;
      }
    }

    await prisma.bookingReference.createMany({
      data: bookingReferencesToCreate,
    });

    handleErrors({ errorPerApp, payload });
  } catch (error) {
    const errorMsg = `Error creating crm event: error: ${safeStringify(error)} Data: ${safeStringify({
      payload,
    })}`;
    log.error(`[Will retry] ${errorMsg}`);
    // Intentional rethrow to trigger retry
    throw error;
  }
}
```

<a id="finding-repository-health-complexity-authorizecredentials-79061825b8"></a>
## Critical complexity in authorizeCredentials

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/auth/lib/next-auth-options.ts:151 has cyclomatic complexity 21, cognitive complexity 40, and maintainability 26.69.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-authorizecredentials-79061825b8"></a>
### Autofix

packages/features/auth/lib/next-auth-options.ts L149-L288

Source: packages/features/auth/lib/next-auth-options.ts L149-L288

```typescript
 * Extracted for testability
 */
export async function authorizeCredentials(
  credentials: Record<"email" | "password" | "totpCode" | "backupCode", string> | undefined
): Promise<User | null> {
  log.debug("CredentialsProvider:credentials:authorize", safeStringify({ credentials }));
  if (!credentials) {
    console.error(`For some reason credentials are missing`);
    throw new Error(ErrorCode.InternalServerError);
  }

  const userRepo = new UserRepository(prisma);
  const user = await userRepo.findByEmailAndIncludeProfilesAndPassword({
    email: credentials.email,
  });
  // Don't leak information about it being username or password that is invalid
  if (!user) {
    throw new Error(ErrorCode.IncorrectEmailPassword);
  }

  // Locked users cannot login
  if (user.locked) {
    throw new Error(ErrorCode.UserAccountLocked);
  }

  await checkRateLimitAndThrowError({
    identifier: hashEmail(user.email),
  });

  // Users without a password must use their identity provider (Google/SAML) to login
  if (!user.password?.hash) {
    throw new Error(ErrorCode.IncorrectEmailPassword);
  }

  // Always verify password for users who have one
  const isCorrectPassword = await verifyPassword(credentials.password, user.password.hash);
  if (!isCorrectPassword) {
    throw new Error(ErrorCode.IncorrectEmailPassword);
  }

  if (user.twoFactorEnabled && credentials.backupCode) {
    if (!process.env.CALENDSO_ENCRYPTION_KEY) {
      console.error("Missing encryption key; cannot proceed with backup code login.");
      throw new Error(ErrorCode.InternalServerError);
    }

    if (!user.backupCodes) throw new Error(ErrorCode.MissingBackupCodes);

    const backupCodes = JSON.parse(symmetricDecrypt(user.backupCodes, process.env.CALENDSO_ENCRYPTION_KEY));

    // check if user-supplied code matches one
    const index = backupCodes.indexOf(credentials.backupCode.replaceAll("-", ""));
    if (index === -1) throw new Error(ErrorCode.IncorrectBackupCode);

    // delete verified backup code and re-encrypt remaining
    backupCodes[index] = null;
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        backupCodes: symmetricEncrypt(JSON.stringify(backupCodes), process.env.CALENDSO_ENCRYPTION_KEY),
      },
    });
  } else if (user.twoFactorEnabled) {
    if (!credentials.totpCode) {
      throw new Error(ErrorCode.SecondFactorRequired);
    }

    if (!user.twoFactorSecret) {
      console.error(`Two factor is enabled for user ${user.id} but they have no secret`);
      throw new Error(ErrorCode.InternalServerError);
    }

    if (!process.env.CALENDSO_ENCRYPTION_KEY) {
      console.error(`"Missing encryption key; cannot proceed with two factor login."`);
      throw new Error(ErrorCode.InternalServerError);
    }

    const secret = symmetricDecrypt(user.twoFactorSecret, process.env.CALENDSO_ENCRYPTION_KEY);
    if (secret.length !== 32) {
      console.error(
        `Two factor secret decryption failed. Expected key with length 32 but got ${secret.length}`
      );
      throw new Error(ErrorCode.InternalServerError);
    }

    const isValidToken = (await import("@calcom/lib/totp")).totpAuthenticatorCheck(
      credentials.totpCode,
      secret
    );
    if (!isValidToken) {
      throw new Error(ErrorCode.IncorrectTwoFactorCode);
    }
  }
  // Check if the user you are logging into has any active teams
  const hasActiveTeams = checkIfUserBelongsToActiveTeam(user);

  // authentication success- but does it meet the minimum password requirements?
  const validateRole = (role: UserPermissionRole) => {
    // User's role is not "ADMIN"
    if (role !== UserPermissionRole.ADMIN) return role;
    // User's identity provider is not "CAL"
    if (user.identityProvider !== IdentityProvider.CAL) return role;

    if (process.env.NEXT_PUBLIC_IS_E2E) {
      console.warn("E2E testing is enabled, skipping password and 2FA requirements for Admin");
      return role;
    }

    // User's password is valid and two-factor authentication is enabled
    if (isPasswordValid(credentials.password, false, true) && user.twoFactorEnabled) return role;
    // Code is running in a development environment
    if (isENVDev) return role;
    // By this point it is an ADMIN without valid security conditions
    return "INACTIVE_ADMIN";
  };

  const role = validateRole(user.role);
  const baseUser = AdapterUserPresenter.fromCalUser(user, role, hasActiveTeams);

  if (role === "INACTIVE_ADMIN") {
    const passwordValid = isPasswordValid(credentials.password, false, true);
    const has2FA = user.twoFactorEnabled;

    let reason: "both" | "password" | "2fa";

    if (!passwordValid && !has2FA) {
      reason = "both";
    } else if (!passwordValid) {
      reason = "password";
    } else {
      reason = "2fa";
    }

    return { ...baseUser, inactiveAdminReason: reason };
  }

  return baseUser;
}
```

<a id="finding-repository-health-complexity-handler-074ca77b34"></a>
## Critical complexity in handler

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

apps/web/app/api/auth/two-factor/totp/disable/route.ts:18 has cyclomatic complexity 21, cognitive complexity 36, and maintainability 29.17.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-handler-074ca77b34"></a>
### Autofix

apps/web/app/api/auth/two-factor/totp/disable/route.ts L16-L123

Source: apps/web/app/api/auth/two-factor/totp/disable/route.ts L16-L123

```typescript
import { buildLegacyRequest } from "@lib/buildLegacyCtx";

async function handler(req: NextRequest) {
  const body = await parseRequestData(req);
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });

  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  if (!session.user?.id) {
    console.error("Session is missing a user id.");
    return NextResponse.json({ error: ErrorCode.InternalServerError }, { status: 500 });
  }

  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `api:totp-disable:${session.user.id}`,
  });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { password: true } });

  if (!user) {
    console.error(`Session references user that no longer exists.`);
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  if (!user.password?.hash && user.identityProvider === IdentityProvider.CAL) {
    return NextResponse.json({ error: ErrorCode.UserMissingPassword }, { status: 400 });
  }

  if (!user.twoFactorEnabled) {
    return NextResponse.json({ message: "Two factor disabled" });
  }

  if (user.password?.hash && user.identityProvider === IdentityProvider.CAL) {
    const isCorrectPassword = await verifyPassword(body.password, user.password.hash);
    if (!isCorrectPassword) {
      return NextResponse.json({ error: ErrorCode.IncorrectPassword }, { status: 400 });
    }
  }

  // If user has 2FA and using backup code
  if (user.twoFactorEnabled && body.backupCode) {
    if (!process.env.CALENDSO_ENCRYPTION_KEY) {
      console.error("Missing encryption key; cannot proceed with backup code login.");
      throw new Error(ErrorCode.InternalServerError);
    }

    if (!user.backupCodes) {
      return NextResponse.json({ error: ErrorCode.MissingBackupCodes }, { status: 400 });
    }

    const backupCodes = JSON.parse(symmetricDecrypt(user.backupCodes, process.env.CALENDSO_ENCRYPTION_KEY));

    // check if user-supplied code matches one
    const index = backupCodes.indexOf(body.backupCode.replaceAll("-", ""));
    if (index === -1) {
      return NextResponse.json({ error: ErrorCode.IncorrectBackupCode }, { status: 400 });
    }

    // we delete all stored backup codes at the end, no need to do this here

    // if user has 2fa and NOT using backup code, try totp
  } else if (user.twoFactorEnabled) {
    if (!body.code) {
      return NextResponse.json({ error: ErrorCode.SecondFactorRequired }, { status: 400 });
    }

    if (!user.twoFactorSecret) {
      console.error(`Two factor is enabled for user ${user.id} but they have no secret`);
      throw new Error(ErrorCode.InternalServerError);
    }

    if (!process.env.CALENDSO_ENCRYPTION_KEY) {
      console.error("Missing encryption key; cannot proceed with two factor login.");
      throw new Error(ErrorCode.InternalServerError);
    }

    const secret = symmetricDecrypt(user.twoFactorSecret, process.env.CALENDSO_ENCRYPTION_KEY);
    if (secret.length !== 32) {
      console.error(
        `Two factor secret decryption failed. Expected key with length 32 but got ${secret.length}`
      );
      throw new Error(ErrorCode.InternalServerError);
    }

    // If user has 2fa enabled, check if body.code is correct
    const isValidToken = totpAuthenticatorCheck(body.code, secret);
    if (!isValidToken) {
      return NextResponse.json({ error: ErrorCode.IncorrectTwoFactorCode }, { status: 400 });
    }
  }

  // Disable 2FA
  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      backupCodes: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  return NextResponse.json({ message: "Two factor disabled" });
}
```

<a id="finding-repository-health-complexity-validate-33e64b8b32"></a>
## Critical complexity in validate

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/platform/types/event-types/event-types_2024_06_14/inputs/booking-fields.input.ts:936 has cyclomatic complexity 21, cognitive complexity 29, and maintainability 37.39.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-validate-33e64b8b32"></a>
### Autofix

packages/platform/types/event-types/event-types_2024_06_14/inputs/booking-fields.input.ts L934-L995

Source: packages/platform/types/event-types/event-types_2024_06_14/inputs/booking-fields.input.ts L934-L995

```typescript
  };

  async validate(bookingFields: { type: string; slug: string }[]) {
    if (!Array.isArray(bookingFields)) {
      throw new BadRequestException(`'bookingFields' must be an array.`);
    }

    if (!bookingFields.length) {
      throw new BadRequestException(`'bookingFields' must contain at least 1 booking field.`);
    }

    const slugs: string[] = [];
    for (const field of bookingFields) {
      const { type, slug } = field;
      const fieldNeedsType =
        slug !== "title" &&
        slug !== "notes" &&
        slug !== "guests" &&
        slug !== "rescheduleReason" &&
        slug !== "location";

      if (fieldNeedsType && !type) {
        throw new BadRequestException(
          `All booking fields except ones with slug equal to title, notes, guests, rescheduleReason and location must have a 'type' property.`
        );
      }

      const fieldNeedsSlug = type !== "name" && type !== "splitName" && type !== "email";
      if (fieldNeedsSlug && !slug) {
        throw new BadRequestException(
          `Each booking field except ones with type equal to name, splitName, email must have a 'slug' property.`
        );
      }

      if (slugs.includes(slug)) {
        throw new BadRequestException(
          `Duplicate bookingFields slug '${slug}' found. All bookingFields slugs must be unique.`
        );
      }
      if (fieldNeedsSlug) {
        slugs.push(slug);
      }

      const ClassType = fieldNeedsType ? this.classMap[type] : this.classMap[slug];
      if (!ClassType) {
        throw new BadRequestException(
          fieldNeedsType
            ? `Unsupported booking field type '${type}'.`
            : `Unsupported booking field slug '${slug}'.`
        );
      }

      const instance = plainToInstance(ClassType, field);
      const errors = await validate(instance);
      if (errors.length > 0) {
        const message = errors.flatMap((error) => Object.values(error.constraints || {})).join(", ");
        throw new BadRequestException(`Validation failed for ${type || slug} booking field: ${message}`);
      }
    }

    return true;
  }
```

<a id="finding-repository-health-complexity-cancelattendeeseat-88f20bf126"></a>
## Critical complexity in cancelAttendeeSeat

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/bookings/lib/handleSeats/cancel/cancelAttendeeSeat.ts:23 has cyclomatic complexity 20, cognitive complexity 43, and maintainability 25.27.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-cancelattendeeseat-88f20bf126"></a>
### Autofix

packages/features/bookings/lib/handleSeats/cancel/cancelAttendeeSeat.ts L21-L187

Source: packages/features/bookings/lib/handleSeats/cancel/cancelAttendeeSeat.ts L21-L187

```typescript
import type { BookingToDelete } from "../../handleCancelBooking";

async function cancelAttendeeSeat(
  data: {
    seatReferenceUid?: string;
    bookingToDelete: BookingToDelete;
  },
  dataForWebhooks: {
    webhooks: {
      id: string;
      subscriberUrl: string;
      payloadTemplate: string | null;
      appId: string | null;
      secret: string | null;
      version: WebhookVersion;
    }[];
    evt: CalendarEvent;
    eventTypeInfo: EventTypeInfo;
  },
  eventTypeMetadata: EventTypeMetadata
) {
  const input = bookingCancelAttendeeSeatSchema.safeParse({
    seatReferenceUid: data.seatReferenceUid,
  });
  const { webhooks, evt, eventTypeInfo } = dataForWebhooks;
  if (!input.success) return;
  const { seatReferenceUid } = input.data;
  const bookingToDelete = data.bookingToDelete;
  if (!bookingToDelete?.attendees.length || bookingToDelete.attendees.length < 2) return;

  if (!bookingToDelete.userId) {
    throw new HttpError({ statusCode: 400, message: "User not found" });
  }

  const seatReference = bookingToDelete.seatsReferences.find(
    (reference) => reference.referenceUid === seatReferenceUid
  );

  if (!seatReference) throw new HttpError({ statusCode: 400, message: "User not a part of this booking" });

  await Promise.all([
    prisma.bookingSeat.delete({
      where: {
        referenceUid: seatReferenceUid,
      },
    }),
    prisma.attendee.delete({
      where: {
        id: seatReference.attendeeId,
      },
    }),
  ]);

  const attendee = bookingToDelete?.attendees.find((attendee) => attendee.id === seatReference.attendeeId);
  const bookingToDeleteUser = bookingToDelete.user ?? null;
  const delegationCredentials = bookingToDeleteUser
    ? // We fetch delegation credentials with ServiceAccount key as CalendarService instance created later in the flow needs it
      await getAllDelegationCredentialsForUserIncludeServiceAccountKey({
        user: { email: bookingToDeleteUser.email, id: bookingToDeleteUser.id },
      })
    : [];

  if (attendee) {
    /* If there are references then we should update them as well */

    const integrationsToUpdate = [];

    for (const reference of bookingToDelete.references) {
      if (reference.credentialId || reference.delegationCredentialId) {
        const credential = await getDelegationCredentialOrFindRegularCredential({
          id: {
            credentialId: reference.credentialId,
            delegationCredentialId: reference.delegationCredentialId,
          },
          delegationCredentials,
        });

        if (credential) {
          const videoCallReference = bookingToDelete.references.find((reference) =>
            reference.type.includes("_video")
          );

          if (videoCallReference) {
            evt.videoCallData = {
              type: videoCallReference.type,
              id: videoCallReference.meetingId,
              password: videoCallReference?.meetingPassword,
              url: videoCallReference.meetingUrl,
            };
          }
          const updatedEvt = {
            ...evt,
            attendees: evt.attendees.filter((evtAttendee) => attendee.email !== evtAttendee.email),
            calendarDescription: getRichDescription(evt),
          };
          if (reference.type.includes("_video") && reference.type !== "google_meet_video") {
            integrationsToUpdate.push(updateMeeting(credential, updatedEvt, reference));
          }
          if (reference.type.includes("_calendar")) {
            const calendar = await getCalendar(credential, "booking");
            if (calendar) {
              integrationsToUpdate.push(
                calendar?.updateEvent(reference.uid, updatedEvt, reference.externalCalendarId)
              );
            }
          }
        }
      }
    }

    try {
      await Promise.all(integrationsToUpdate);
    } catch {
      // Shouldn't stop code execution if integrations fail
      // as integrations was already updated
    }

    const tAttendees = await getTranslation(attendee.locale ?? "en", "common");

    await sendCancelledSeatEmailsAndSMS(
      evt,
      {
        ...attendee,
        language: { translate: tAttendees, locale: attendee.locale ?? "en" },
      },
      eventTypeMetadata
    );
  }

  evt.attendees = attendee
    ? [
        {
          ...attendee,
          language: {
            translate: await getTranslation(attendee.locale ?? "en", "common"),
            locale: attendee.locale ?? "en",
          },
        },
      ]
    : [];

  const payload: EventPayloadType = {
    ...evt,
    ...eventTypeInfo,
    status: "CANCELLED",
    smsReminderNumber: bookingToDelete.smsReminderNumber || undefined,
    requestReschedule: false,
  };

  const promises = webhooks.map((webhook) =>
    sendPayload(
      webhook.secret,
      WebhookTriggerEvents.BOOKING_CANCELLED,
      new Date().toISOString(),
      webhook,
      payload
    ).catch((e) => {
      logger.error(
        `Error executing webhook for event: ${WebhookTriggerEvents.BOOKING_CANCELLED}, URL: ${webhook.subscriberUrl}, bookingId: ${evt.bookingId}, bookingUid: ${evt.uid}`,
        safeStringify(e)
      );
    })
  );
  await Promise.all(promises);

  return { success: true };
}
```

<a id="finding-repository-health-complexity-getserversideprops-788303db32"></a>
## Critical complexity in getServerSideProps

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

apps/web/lib/reschedule/[uid]/getServerSideProps.ts:24 has cyclomatic complexity 20, cognitive complexity 21, and maintainability 24.05.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-getserversideprops-788303db32"></a>
### Autofix

apps/web/lib/reschedule/[uid]/getServerSideProps.ts L22-L208

Source: apps/web/lib/reschedule/[uid]/getServerSideProps.ts L22-L208

```typescript
});

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession({ req: context.req });

  const {
    uid: bookingUid,
    seatReferenceUid,
    rescheduledBy,
    /**
     * This is for the case of request-reschedule where the booking is cancelled
     */
    allowRescheduleForCancelledBooking,
  } = querySchema.parse(context.query);

  const coepFlag = context.query["flag.coep"];
  const {
    uid,
    seatReferenceUid: maybeSeatReferenceUid,
    bookingSeat,
  } = await maybeGetBookingUidFromSeat(prisma, seatReferenceUid ? seatReferenceUid : bookingUid);

  const booking = await prisma.booking.findUnique({
    where: {
      uid,
    },
    select: {
      ...bookingMinimalSelect,
      userId: true,
      responses: true,
      eventType: {
        select: {
          users: {
            select: {
              username: true,
            },
          },
          slug: true,
          allowReschedulingPastBookings: true,
          disableRescheduling: true,
          allowReschedulingCancelledBookings: true,
          minimumRescheduleNotice: true,
          team: {
            select: {
              id: true,
              parentId: true,
              slug: true,
            },
          },
          seatsPerTimeSlot: true,
          userId: true,
          owner: {
            select: {
              id: true,
            },
          },
          hosts: {
            select: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      dynamicEventSlugRef: true,
      dynamicGroupSlugRef: true,
      user: true,
      status: true,
    },
  });
  const dynamicEventSlugRef = booking?.dynamicEventSlugRef || "";

  if (!booking) {
    return {
      notFound: true,
    } as const;
  }
  const eventType = booking.eventType ? booking.eventType : getDefaultEvent(dynamicEventSlugRef);

  const userRepo = new UserRepository(prisma);
  const enrichedBookingUser = booking.user
    ? await userRepo.enrichUserWithItsProfile({ user: booking.user })
    : null;

  const eventUrl = await buildEventUrlFromBooking({
    eventType,
    dynamicGroupSlugRef: booking.dynamicGroupSlugRef ?? null,
    profileEnrichedBookingUser: enrichedBookingUser,
  });

  if (!booking?.eventType && !booking?.dynamicEventSlugRef) {
    // TODO: Show something in UI to let user know that this booking is not rescheduleable
    return {
      notFound: true,
    } as const;
  }

  // Check if reschedule should be prevented based on booking status and event type settings
  const reschedulePreventionRedirectUrl = determineReschedulePreventionRedirect({
    booking: {
      uid,
      status: booking.status,
      startTime: booking.startTime,
      endTime: booking.endTime,
      responses: booking.responses,
      userId: booking.userId,
      eventType: {
        disableRescheduling: !!eventType?.disableRescheduling,
        allowReschedulingPastBookings: eventType.allowReschedulingPastBookings,
        allowBookingFromCancelledBookingReschedule: !!eventType.allowReschedulingCancelledBookings,
        minimumRescheduleNotice: eventType.minimumRescheduleNotice,
        teamId: eventType.team?.id ?? null,
      },
    },
    eventUrl,
    forceRescheduleForCancelledBooking: allowRescheduleForCancelledBooking,
    currentUserId: session?.user?.id ?? null,
    bookingSeat,
  });

  if (reschedulePreventionRedirectUrl) {
    return {
      redirect: {
        destination: reschedulePreventionRedirectUrl,
        permanent: false,
      },
    };
  }

  // if booking event type is for a seated event and no seat reference uid is provided, throw not found
  if (booking?.eventType?.seatsPerTimeSlot && !maybeSeatReferenceUid) {
    const userId = session?.user?.id;

    if (!userId && !seatReferenceUid) {
      return {
        redirect: {
          destination: `/auth/login?callbackUrl=/reschedule/${bookingUid}`,
          permanent: false,
        },
      };
    }
    const userIsHost = booking?.eventType.hosts.find((host) => {
      if (host.user.id === userId) return true;
    });

    const userIsOwnerOfEventType = booking?.eventType.owner?.id === userId;

    if (!userIsHost && !userIsOwnerOfEventType) {
      return {
        notFound: true,
      } as {
        notFound: true;
      };
    }
  }

  const destinationUrlSearchParams = new URLSearchParams();

  destinationUrlSearchParams.set("rescheduleUid", seatReferenceUid || bookingUid);

  if (allowRescheduleForCancelledBooking) {
    destinationUrlSearchParams.set("allowRescheduleForCancelledBooking", "true");
  }

  // TODO: I think we should just forward all the query params here including coep flag
  if (coepFlag) {
    destinationUrlSearchParams.set("flag.coep", coepFlag as string);
  }

  const currentUserEmail = rescheduledBy ?? session?.user?.email;

  if (currentUserEmail) {
    destinationUrlSearchParams.set("rescheduledBy", currentUserEmail);
  }

  return {
    redirect: {
      destination: `${eventUrl}?${destinationUrlSearchParams.toString()}${
        eventType.seatsPerTimeSlot ? "&bookingUid=null" : ""
      }`,
      permanent: false,
    },
  };
}
```

<a id="finding-repository-health-complexity-getallrecordingsolderthan6months-1f76292bbf"></a>
## Critical complexity in getAllRecordingsOlderThan6Months

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/app-store/dailyvideo/lib/scripts/deleteRecordings.ts:29 has cyclomatic complexity 19, cognitive complexity 40, and maintainability 25.87.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-getallrecordingsolderthan6months-1f76292bbf"></a>
### Autofix

packages/app-store/dailyvideo/lib/scripts/deleteRecordings.ts L27-L170

Source: packages/app-store/dailyvideo/lib/scripts/deleteRecordings.ts L27-L170

```typescript
}

async function getAllRecordingsOlderThan6Months(): Promise<Recording[]> {
  const apiKey = process.env.DAILY_API_KEY;

  if (!apiKey) {
    console.error("DAILY_API_KEY environment variable is required");
    process.exit(1);
  }

  const baseUrl = "https://api.daily.co/v1/recordings";
  const allRecordings: Recording[] = [];
  const limit = 100;

  // Calculate date 6 months ago
  const cutoffDate = new Date();
  cutoffDate.setUTCMonth(cutoffDate.getUTCMonth() - 6);
  cutoffDate.setUTCHours(0, 0, 0, 0);
  const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);

  console.log(
    `Fetching all recordings older than 6 months (before ${
      cutoffDate.toISOString().split("T")[0]
    }, timestamp: ${cutoffTimestamp})...`
  );

  let hasMoreRecordings = true;
  let requestCount = 0;
  const startTime = Date.now();
  let endingBefore = "OLDEST";

  while (hasMoreRecordings) {
    requestCount++;
    const elapsedTime = Date.now() - startTime;
    const expectedMinTime = (requestCount - 1) * 50;

    if (elapsedTime < expectedMinTime) {
      const delayTime = expectedMinTime - elapsedTime;
      console.log(`Rate limiting: waiting ${delayTime}ms before next request...`);
      await new Promise((resolve) => setTimeout(resolve, delayTime));
    }

    const url = new URL(baseUrl);
    url.searchParams.append("limit", limit.toString());

    if (endingBefore) {
      url.searchParams.append("ending_before", endingBefore);
    }

    let retries = 0;
    const maxRetries = 5;
    let response: Response | undefined;

    while (retries <= maxRetries) {
      try {
        console.log("url", url.toString());
        response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          break;
        }

        if (response.status === 404) {
          console.log("No recordings found or endpoint not available");
          return [];
        }

        if (response.status === 429) {
          if (retries < maxRetries) {
            const backoffDelay = Math.pow(2, retries) * 1000;
            console.log(
              `Rate limit exceeded (429). Retrying in ${backoffDelay / 1000}s... (attempt ${retries + 1}/${
                maxRetries + 1
              })`
            );
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
            retries++;
            continue;
          } else {
            throw new Error(`Rate limit exceeded after ${maxRetries + 1} attempts`);
          }
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      } catch (error) {
        if (retries < maxRetries && (error as Error).message.includes("fetch")) {
          const backoffDelay = Math.pow(2, retries) * 1000;
          console.log(
            `Network error. Retrying in ${backoffDelay / 1000}s... (attempt ${retries + 1}/${maxRetries + 1})`
          );
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          retries++;
          continue;
        }
        throw error;
      }
    }

    if (!response?.ok) {
      throw new Error(`Failed to fetch recordings after ${maxRetries + 1} attempts`);
    }

    const data = (await response.json()) as RecordingsResponse;

    if (!data.data || data.data.length === 0) {
      console.log("No more recordings available, ending pagination");
      hasMoreRecordings = false;
      break;
    }

    const filteredRecordings = data.data.filter((recording) => {
      return recording.start_ts < cutoffTimestamp;
    });

    allRecordings.push(...filteredRecordings);
    console.log(
      `Fetched ${data.data.length} recordings, ${filteredRecordings.length} older than 6 months (total: ${allRecordings.length})`
    );

    endingBefore = data.data[0].id;
    console.log("endingBefore", endingBefore);
    console.log("first recording in batch", data.data[0]);
    console.log("last recording in batch", data.data[data.data.length - 1]);

    if (data.data.length < limit) {
      console.log("Received fewer results than limit, reached end of data");
      hasMoreRecordings = false;
      break;
    }

    if (filteredRecordings.length === 0 && data.data.every((r) => r.start_ts >= cutoffTimestamp)) {
      console.log("Reached recordings newer than 6 months, stopping");
      hasMoreRecordings = false;
      break;
    }
  }

  return allRecordings;
}
```

<a id="finding-repository-health-complexity-makesqlcondition-dd6bea900f"></a>
## Critical complexity in makeSqlCondition

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/data-table/lib/server.ts:183 has cyclomatic complexity 19, cognitive complexity 22, and maintainability 39.72.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-makesqlcondition-dd6bea900f"></a>
### Autofix

packages/features/data-table/lib/server.ts L181-L231

Source: packages/features/data-table/lib/server.ts L181-L231

```typescript
 * Builds a SQL where clause for use with raw SQL queries
 */
export function makeSqlCondition(filterValue: FilterValue): Prisma.Sql | null {
  if (isMultiSelectFilterValue(filterValue)) {
    return Prisma.sql`= ANY(${filterValue.data})`;
  } else if (isSingleSelectFilterValue(filterValue)) {
    return Prisma.sql`= ${filterValue.data}`;
  } else if (isTextFilterValue(filterValue)) {
    const { operator, operand } = filterValue.data;
    switch (operator) {
      case "equals":
        return Prisma.sql`= ${operand}`;
      case "notEquals":
        return Prisma.sql`!= ${operand}`;
      case "contains":
        return Prisma.sql`ILIKE ${`%${operand}%`}`;
      case "notContains":
        return Prisma.sql`NOT ILIKE ${`%${operand}%`}`;
      case "startsWith":
        return Prisma.sql`ILIKE ${`${operand}%`}`;
      case "endsWith":
        return Prisma.sql`ILIKE ${`%${operand}`}`;
      case "isEmpty":
        return Prisma.sql`= ''`;
      case "isNotEmpty":
        return Prisma.sql`!= ''`;
      default:
        return null;
    }
  } else if (isNumberFilterValue(filterValue)) {
    const { operator, operand } = filterValue.data;
    switch (operator) {
      case "eq":
        return Prisma.sql`= ${operand}`;
      case "neq":
        return Prisma.sql`!= ${operand}`;
      case "gt":
        return Prisma.sql`> ${operand}`;
      case "gte":
        return Prisma.sql`>= ${operand}`;
      case "lt":
        return Prisma.sql`< ${operand}`;
      case "lte":
        return Prisma.sql`<= ${operand}`;
      default:
        return null;
    }
  }

  return null;
}
```

<a id="finding-repository-health-complexity-posthandler-a46c710db0"></a>
## Critical complexity in postHandler

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

apps/web/app/api/recorded-daily-video/route.ts:54 has cyclomatic complexity 18, cognitive complexity 38, and maintainability 23.02.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-posthandler-a46c710db0"></a>
### Autofix

apps/web/app/api/recorded-daily-video/route.ts L52-L237

Source: apps/web/app/api/recorded-daily-video/route.ts L52-L237

```typescript
};

export async function postHandler(request: NextRequest) {
  const body = await request.json();

  if (testRequestSchema.safeParse(body).success) {
    return NextResponse.json({ message: "Test request successful" });
  }

  const headersList = await headers();
  const testMode = process.env.NEXT_PUBLIC_IS_E2E || process.env.INTEGRATION_TEST_MODE;

  if (!testMode) {
    const hmacSecret = process.env.DAILY_WEBHOOK_SECRET;
    if (!hmacSecret) {
      return NextResponse.json({ message: "No Daily Webhook Secret" }, { status: 405 });
    }

    const webhookTimestamp = headersList.get("x-webhook-timestamp");
    const computed_signature = computeSignature(hmacSecret, body, webhookTimestamp);

    if (headersList.get("x-webhook-signature") !== computed_signature) {
      return NextResponse.json({ message: "Signature does not match" }, { status: 403 });
    }
  }

  log.info(
    "Daily video webhook Request Body:",
    safeStringify({
      body,
    })
  );

  try {
    if (body?.type === "recording.ready-to-download") {
      const recordingReadyResponse = recordingReadySchema.safeParse(body);

      if (!recordingReadyResponse.success) {
        return NextResponse.json({ message: "Invalid Payload" }, { status: 400 });
      }

      const { room_name, recording_id, status } = recordingReadyResponse.data.payload;

      if (status !== "finished") {
        return NextResponse.json({ message: "Recording not finished" }, { status: 400 });
      }

      const bookingReference = await getBookingReference(room_name);
      const booking = await getBooking(bookingReference.bookingId as number);

      const bookingRepository = new BookingRepository(prisma);

      const [evt, updateRecordStatus, downloadLink, teamId] = await Promise.all([
        getCalendarEvent(booking),
        bookingRepository.updateRecordedStatus({
          bookingUid: booking.uid,
          isRecorded: true,
        }),
        getProxyDownloadLinkOfCalVideo(recording_id),
        getTeamIdFromEventType({
          eventType: {
            team: { id: booking?.eventType?.teamId ?? null },
            parentId: booking?.eventType?.parentId ?? null,
          },
        }),
      ]);

      const tasks = [
        {
          fn: triggerRecordingReadyWebhook({
            evt,
            downloadLink,
            booking: {
              userId: booking?.user?.id,
              eventTypeId: booking.eventTypeId,
              eventTypeParentId: booking.eventType?.parentId,
              teamId,
            },
          }),
          errorMsg: "trigger recording ready webhook",
        },
        {
          fn: submitBatchProcessorTranscriptionJob(recording_id),
          errorMsg: "submit transcription batch processor job",
        },
        {
          fn: sendDailyVideoRecordingEmails(evt, downloadLink),
          errorMsg: "send recording emails",
        },
      ];

      const results = await Promise.allSettled(tasks.map((t) => t.fn));

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          log.error(`Failed to ${tasks[index].errorMsg}:`, safeStringify(result.reason));
        }
      });

      return NextResponse.json({ message: "Success" });
    } else if (body.type === "meeting.ended") {
      const meetingEndedResponse = meetingEndedSchema.safeParse(body);
      if (!meetingEndedResponse.success) {
        return NextResponse.json({ message: "Invalid Payload" }, { status: 400 });
      }

      const { room, meeting_id } = meetingEndedResponse.data.payload;

      const bookingReference = await getBookingReference(room);
      const booking = await getBooking(bookingReference.bookingId as number);

      if (!booking.eventType?.canSendCalVideoTranscriptionEmails) {
        return NextResponse.json({
          message: `Transcription emails are disabled for this event type ${booking.eventTypeId}`,
        });
      }

      const transcripts = await getAllTranscriptsAccessLinkFromMeetingId(meeting_id);

      if (!transcripts || !transcripts.length)
        return NextResponse.json({
          message: `No Transcripts found for room name ${room} and meeting id ${meeting_id}`,
        });

      const evt = await getCalendarEvent(booking);
      await sendDailyVideoTranscriptEmails(evt, transcripts);

      return NextResponse.json({ message: "Success" });
    } else if (body?.type === "batch-processor.job-finished") {
      const batchProcessorJobFinishedResponse = batchProcessorJobFinishedSchema.safeParse(body);

      if (!batchProcessorJobFinishedResponse.success) {
        return NextResponse.json({ message: "Invalid Payload" }, { status: 400 });
      }

      const { id, input } = batchProcessorJobFinishedResponse.data.payload;
      const roomName = await getRoomNameFromRecordingId(input.recordingId);

      const bookingReference = await getBookingReference(roomName);

      const booking = await getBooking(bookingReference.bookingId as number);

      const teamId = await getTeamIdFromEventType({
        eventType: {
          team: { id: booking?.eventType?.teamId ?? null },
          parentId: booking?.eventType?.parentId ?? null,
        },
      });

      const [evt, recording, batchProcessorJobAccessLink] = await Promise.all([
        getCalendarEvent(booking),
        getProxyDownloadLinkOfCalVideo(input.recordingId),
        getBatchProcessorJobAccessLink(id),
      ]);

      await triggerTranscriptionGeneratedWebhook({
        evt,
        downloadLinks: {
          transcription: batchProcessorJobAccessLink.transcription,
          recording,
        },
        booking: {
          userId: booking?.user?.id,
          eventTypeId: booking.eventTypeId,
          eventTypeParentId: booking.eventType?.parentId,
          teamId,
        },
      });

      return NextResponse.json({ message: "Success" });
    } else {
      log.error("Invalid type in /recorded-daily-video", body);
      return NextResponse.json({
        message: "Invalid type in /recorded-daily-video",
      });
    }
  } catch (err) {
    log.error("Error in /recorded-daily-video", err);

    if (err instanceof HttpError) {
      return NextResponse.json({ message: err.message }, { status: err.statusCode });
    } else {
      return NextResponse.json({ message: "something went wrong" }, { status: 500 });
    }
  }
}
```

<a id="finding-repository-health-complexity-listbookings-cc5211fc34"></a>
## Critical complexity in listBookings

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/webhooks/lib/scheduleTrigger.ts:182 has cyclomatic complexity 17, cognitive complexity 26, and maintainability 32.23.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-listbookings-cc5211fc34"></a>
### Autofix

packages/features/webhooks/lib/scheduleTrigger.ts L180-L280

Source: packages/features/webhooks/lib/scheduleTrigger.ts L180-L280

```typescript
}

export async function listBookings(
  appApiKey?: ApiKey,
  account?: {
    id: number;
    name: string | null;
    isTeam: boolean;
  } | null
) {
  const userId = appApiKey ? appApiKey.userId : account && !account.isTeam ? account.id : null;
  const teamId = appApiKey ? appApiKey.teamId : account && account.isTeam ? account.id : null;
  try {
    const where: Prisma.BookingWhereInput = {};
    if (teamId) {
      where.eventType = {
        OR: [{ teamId }, { parent: { teamId } }],
      };
    } else {
      where.eventType = { userId };
    }

    const bookings = await prisma.booking.findMany({
      take: 3,
      where: where,
      orderBy: {
        id: "desc",
      },
      select: {
        uid: true,
        title: true,
        description: true,
        customInputs: true,
        responses: true,
        startTime: true,
        endTime: true,
        location: true,
        cancellationReason: true,
        status: true,
        metadata: true,
        user: {
          select: {
            username: true,
            name: true,
            email: true,
            timeZone: true,
            locale: true,
          },
        },
        eventType: {
          select: {
            title: true,
            description: true,
            requiresConfirmation: true,
            price: true,
            currency: true,
            length: true,
            bookingFields: true,
            team: true,
          },
        },
        attendees: {
          select: {
            name: true,
            email: true,
            timeZone: true,
          },
        },
      },
    });
    if (bookings.length === 0) {
      return [];
    }
    const t = await getTranslation(bookings[0].user?.locale ?? "en", "common");

    const updatedBookings = bookings.map((booking) => {
      const parsedMetadata = bookingMetadataSchema.safeParse(booking.metadata || {});
      return {
        ...booking,
        ...getCalEventResponses({
          bookingFields: booking.eventType?.bookingFields ?? null,
          booking,
        }),
        location: getHumanReadableLocationValue(booking.location || "", t),
        metadata: {
          videoCallUrl: parsedMetadata.success ? parsedMetadata.data?.videoCallUrl : undefined,
        },
      };
    });

    return updatedBookings;
  } catch (err) {
    const userId = appApiKey ? appApiKey.userId : account && !account.isTeam ? account.id : null;
    const teamId = appApiKey ? appApiKey.teamId : account && account.isTeam ? account.id : null;

    log.error(
      `Error retrieving list of bookings for ${teamId ? `team ${teamId}` : `user ${userId}`}.`,
      safeStringify(err)
    );
  }
}
```

<a id="finding-repository-health-complexity-handler-8a6b2cd78f"></a>
## Critical complexity in handler

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/app-store/btcpayserver/api/webhook.ts:44 has cyclomatic complexity 17, cognitive complexity 17, and maintainability 34.67.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-handler-8a6b2cd78f"></a>
### Autofix

packages/app-store/btcpayserver/api/webhook.ts L42-L108

Source: packages/app-store/btcpayserver/api/webhook.ts L42-L108

```typescript
const SUPPORTED_INVOICE_EVENTS = ["InvoiceSettled", "InvoiceProcessing"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") throw new HttpCode({ statusCode: 405, message: "Method Not Allowed" });
    const rawBody = await getRawBody(req);
    const bodyAsString = rawBody.toString();

    const signature = req.headers["btcpay-sig"] || req.headers["BTCPay-Sig"];
    if (!signature || typeof signature !== "string" || !signature.startsWith("sha256="))
      throw new HttpCode({ statusCode: 401, message: "Missing or invalid signature format" });

    const webhookData = btcpayWebhookSchema.safeParse(JSON.parse(bodyAsString));
    if (!webhookData.success) return res.status(400).json({ message: "Invalid webhook payload" });

    const data = webhookData.data;
    if (!SUPPORTED_INVOICE_EVENTS.includes(data.type))
      return res.status(200).send({ message: "Webhook received but ignored" });

    const bookingPaymentRepository = new BookingPaymentRepository();
    const payment = await bookingPaymentRepository.findByExternalIdIncludeBookingUserCredentials(
      data.invoiceId,
      appConfig.type
    );
    if (!payment) throw new HttpCode({ statusCode: 404, message: "Cal.diy: payment not found" });
    if (payment.success) return res.status(200).send({ message: "Payment already registered" });
    const key = payment.booking?.user?.credentials?.[0].key;
    if (!key) throw new HttpCode({ statusCode: 404, message: "Cal.diy: credentials not found" });

    const parsedKey = btcpayCredentialKeysSchema.safeParse(key);
    if (!parsedKey.success)
      throw new HttpCode({ statusCode: 400, message: "Cal.diy: Invalid BTCPay credentials" });

    const { webhookSecret, storeId } = parsedKey.data;
    if (storeId !== data.storeId)
      throw new HttpCode({ statusCode: 400, message: "Cal.diy: Store ID mismatch" });

    const expectedSignature = signature.split("=")[1];
    const computedSignature = verifyBTCPaySignature(rawBody, expectedSignature, webhookSecret);

    if (computedSignature.length !== expectedSignature.length) {
      throw new HttpCode({ statusCode: 400, message: "signature mismatch" });
    }
    const isValid = crypto.timingSafeEqual(
      Buffer.from(computedSignature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
    if (!isValid) throw new HttpCode({ statusCode: 400, message: "signature mismatch" });

    const traceContext = distributedTracing.createTrace("btcpayserver_webhook", {
      meta: { paymentId: payment.id, bookingId: payment.bookingId },
    });
    await handlePaymentSuccess({
      paymentId: payment.id,
      bookingId: payment.bookingId,
      appSlug: appConfig.slug,
      traceContext,
    });
    return res.status(200).json({ success: true });
  } catch (_err) {
    const err = getServerErrorFromUnknown(_err);
    return res.status(err.statusCode).send({
      message: err.message,
      stack: IS_PRODUCTION ? undefined : err.cause?.stack,
    });
  }
}
```

<a id="finding-repository-health-complexity-gethandler-0a4d35f32d"></a>
## Critical complexity in getHandler

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/app-store/googlecalendar/api/callback.ts:26 has cyclomatic complexity 16, cognitive complexity 27, and maintainability 25.59.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-gethandler-0a4d35f32d"></a>
### Autofix

packages/app-store/googlecalendar/api/callback.ts L24-L185

Source: packages/app-store/googlecalendar/api/callback.ts L24-L185

```typescript
import { getGoogleAppKeys } from "../lib/getGoogleAppKeys";

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  const state = decodeOAuthState(req);

  if (typeof code !== "string") {
    if (state?.onErrorReturnTo || state?.returnTo) {
      res.redirect(
        getSafeRedirectUrl(state.onErrorReturnTo) ??
          getSafeRedirectUrl(state?.returnTo) ??
          `${WEBAPP_URL}/apps/installed`
      );
      return;
    }
    throw new HttpError({ statusCode: 400, message: "`code` must be a string" });
  }

  if (!req.session?.user?.id) {
    throw new HttpError({ statusCode: 401, message: "You must be logged in to do this" });
  }

  const { client_id, client_secret } = await getGoogleAppKeys();

  const redirect_uri = `${WEBAPP_URL_FOR_OAUTH}/api/integrations/googlecalendar/callback`;

  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uri);

  if (code) {
    const token = await oAuth2Client.getToken(code);
    const key = token.tokens;
    const grantedScopes = token.tokens.scope?.split(" ") ?? [];
    // Check if we have granted all required permissions
    const hasMissingRequiredScopes = GOOGLE_CALENDAR_SCOPES.some((scope) => !grantedScopes.includes(scope));
    if (hasMissingRequiredScopes) {
      if (!state?.fromApp) {
        throw new HttpError({
          statusCode: 400,
          message: "You must grant all permissions to use this integration",
        });
      }
      res.redirect(
        getSafeRedirectUrl(state.onErrorReturnTo) ??
          getSafeRedirectUrl(state?.returnTo) ??
          `${WEBAPP_URL}/apps/installed`
      );
      return;
    }

    oAuth2Client.setCredentials(key);

    const gcalCredentialData = buildCredentialCreateData({
      userId: req.session.user.id,
      key,
      appId: "google-calendar",
      type: "google_calendar",
    });
    const gcalCredential = await CredentialRepository.create(gcalCredentialData);

    const gCalService = createGoogleCalendarServiceWithGoogleType({
      ...gcalCredential,
      user: null,
      delegatedTo: null,
    });

    const calendar = new calendar_v3.Calendar({
      auth: oAuth2Client,
    });

    const primaryCal = await gCalService.getPrimaryCalendar(calendar);

    // If we still don't have a primary calendar skip creating the selected calendar.
    // It can be toggled on later.
    if (!primaryCal?.id) {
      res.redirect(
        getSafeRedirectUrl(state?.returnTo) ??
          getInstalledAppPath({ variant: "calendar", slug: "google-calendar" })
      );
      return;
    }

    // Only attempt to update the user's profile photo if the user has granted the required scope
    if (grantedScopes.includes(SCOPE_USERINFO_PROFILE)) {
      await updateProfilePhotoGoogle(oAuth2Client, req.session.user.id);
    }

    const selectedCalendarWhereUnique = {
      userId: req.session.user.id,
      externalId: primaryCal.id,
      integration: "google_calendar",
    };

    // Wrapping in a try/catch to reduce chance of race conditions-
    // also this improves performance for most of the happy-paths.
    try {
      await gCalService.upsertSelectedCalendar({
        // First install should add a user-level selectedCalendar only.
        eventTypeId: null,
        externalId: selectedCalendarWhereUnique.externalId,
      });
    } catch (error) {
      let errorMessage = "something_went_wrong";
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        // it is possible a selectedCalendar was orphaned, in this situation-
        // we want to recover by connecting the existing selectedCalendar to the new Credential.
        if (await renewSelectedCalendarCredentialId(selectedCalendarWhereUnique, gcalCredential.id)) {
          res.redirect(
            getSafeRedirectUrl(state?.returnTo) ??
              getInstalledAppPath({ variant: "calendar", slug: "google-calendar" })
          );
          return;
        }
        // else
        errorMessage = "account_already_linked";
      }
      await CredentialRepository.deleteById({ id: gcalCredential.id });
      res.redirect(
        `${
          getSafeRedirectUrl(state?.onErrorReturnTo) ??
          getInstalledAppPath({ variant: "calendar", slug: "google-calendar" })
        }?error=${errorMessage}`
      );
      return;
    }
  }

  // No need to install? Redirect to the returnTo URL
  if (!state?.installGoogleVideo) {
    res.redirect(
      getSafeRedirectUrl(state?.returnTo) ??
        getInstalledAppPath({ variant: "calendar", slug: "google-calendar" })
    );
    return;
  }

  const existingGoogleMeetCredential = await CredentialRepository.findFirstByUserIdAndType({
    userId: req.session.user.id,
    type: "google_video",
  });

  // If the user already has a google meet credential, there's nothing to do in here
  if (existingGoogleMeetCredential) {
    res.redirect(
      getSafeRedirectUrl(`${WEBAPP_URL}/apps/installed/conferencing?hl=google-meet`) ??
        getInstalledAppPath({ variant: "conferencing", slug: "google-meet" })
    );
    return;
  }

  // Create a new google meet credential
  const googleMeetCredentialData = buildCredentialCreateData({
    userId: req.session.user.id,
    type: "google_video",
    key: {},
    appId: "google-meet",
  });
  await CredentialRepository.create(googleMeetCredentialData);
  res.redirect(
    getSafeRedirectUrl(`${WEBAPP_URL}/apps/installed/conferencing?hl=google-meet`) ??
      getInstalledAppPath({ variant: "conferencing", slug: "google-meet" })
  );
}
```

<a id="finding-repository-health-complexity-updateallcalendarevents-ff090ad106"></a>
## Critical complexity in updateAllCalendarEvents

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/bookings/lib/EventManager.ts:1100 has cyclomatic complexity 15, cognitive complexity 26, and maintainability 28.49.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-updateallcalendarevents-ff090ad106"></a>
### Autofix

packages/features/bookings/lib/EventManager.ts L1098-L1231

Source: packages/features/bookings/lib/EventManager.ts L1098-L1231

```typescript
   * @private
   */
  private async updateAllCalendarEvents(
    event: CalendarEvent,
    booking: PartialBooking,
    newBookingId?: number
  ): Promise<Array<EventResult<NewCalendarEventType>>> {
    let calendarReference: PartialReference[] | undefined = undefined,
      credential;
    log.silly("updateAllCalendarEvents", JSON.stringify({ event, booking, newBookingId }));
    try {
      // If a newBookingId is given, update that calendar event
      let newBooking;
      if (newBookingId) {
        newBooking = await prisma.booking.findUnique({
          where: {
            id: newBookingId,
          },
          select: {
            references: true,
          },
        });
      }

      calendarReference = newBooking?.references.length
        ? newBooking.references.filter((reference) => reference.type.includes("_calendar"))
        : booking.references.filter((reference) => reference.type.includes("_calendar"));

      if (calendarReference.length === 0) {
        return [];
      }
      // process all calendar references
      let result = [];
      for (const reference of calendarReference) {
        const { uid: bookingRefUid, externalCalendarId: bookingExternalCalendarId } = reference;
        let calendarExternalId: string | null = null;
        if (bookingExternalCalendarId) {
          calendarExternalId = bookingExternalCalendarId;
        }

        if (reference.credentialId) {
          credential = this.calendarCredentials.filter(
            (credential) => credential.id === reference?.credentialId
          )[0];
          if (!credential) {
            // Fetch credential from DB
            const credentialFromDB = await CredentialRepository.findCredentialForCalendarServiceById({
              id: reference.credentialId,
            });
            if (credentialFromDB && credentialFromDB.appId) {
              credential = {
                id: credentialFromDB.id,
                type: credentialFromDB.type,
                key: credentialFromDB.key,
                userId: credentialFromDB.userId,
                teamId: credentialFromDB.teamId,
                invalid: credentialFromDB.invalid,
                appId: credentialFromDB.appId,
                user: credentialFromDB.user,
                encryptedKey: credentialFromDB.encryptedKey,
                delegatedToId: credentialFromDB.delegatedToId,
                delegatedTo: credentialFromDB.delegatedTo,
                delegationCredentialId: credentialFromDB.delegationCredentialId,
              };
            }
          }
          result.push(updateEvent(credential, event, bookingRefUid, calendarExternalId));
        } else {
          const credentials = this.calendarCredentials.filter(
            (credential) => credential.type === reference?.type
          );
          for (const credential of credentials) {
            log.silly("updateAllCalendarEvents-credential", JSON.stringify({ credentials }));
            result.push(updateEvent(credential, event, bookingRefUid, calendarExternalId));
          }
        }
      }
      // If we are merging two calendar events we should delete the old calendar event
      if (newBookingId) {
        const oldCalendarEvent = booking.references.find((reference) => reference.type.includes("_calendar"));

        if (oldCalendarEvent?.credentialId) {
          const calendarCredential = await CredentialRepository.findCredentialForCalendarServiceById({
            id: oldCalendarEvent.credentialId,
          });
          const calendar = await getCalendar(calendarCredential, "booking");
          await calendar?.deleteEvent(oldCalendarEvent.uid, event, oldCalendarEvent.externalCalendarId);
        }
      }

      // Taking care of non-traditional calendar integrations
      result = result.concat(
        this.calendarCredentials
          .filter((cred) => cred.type.includes("other_calendar"))
          .map(async (cred) => {
            const calendarReference = booking.references.find((ref) => ref.type === cred.type);

            if (!calendarReference) {
              return {
                appName: cred.appName || cred.appId || "",
                type: cred.type,
                success: false,
                uid: "",
                originalEvent: event,
                credentialId: cred.id,
              };
            }
            const { externalCalendarId: bookingExternalCalendarId, meetingId: bookingRefUid } =
              calendarReference;
            return await updateEvent(cred, event, bookingRefUid ?? null, bookingExternalCalendarId ?? null);
          })
      );

      return Promise.all(result);
    } catch (error) {
      let message = `Tried to 'updateAllCalendarEvents' but there was no '{thing}' for '${credential?.type}', userId: '${credential?.userId}', bookingId: '${booking?.id}'`;
      if (error instanceof Error) {
        message = message.replace("{thing}", error.message);
      }

      return Promise.resolve(
        calendarReference?.map((reference) => {
          return {
            appName: "none",
            type: reference?.type || "calendar",
            success: false,
            uid: "",
            originalEvent: event,
            credentialId: 0,
          };
        }) ?? ([] as Array<EventResult<NewCalendarEventType>>)
      );
    }
  }
```

<a id="finding-repository-health-complexity-handler-5e21cda35d"></a>
## Critical complexity in handler

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/app-store/stripepayment/api/subscription.ts:12 has cyclomatic complexity 14, cognitive complexity 21, and maintainability 34.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-handler-5e21cda35d"></a>
### Autofix

packages/app-store/stripepayment/api/subscription.ts L10-L91

Source: packages/app-store/stripepayment/api/subscription.ts L10-L91

```typescript
import stripe from "../lib/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const session = await getServerSession({ req });
    const userId = session?.user?.id;
    let { intentUsername = null } = req.query;
    const { callbackUrl } = req.query;
    if (!userId || !intentUsername) {
      res.status(404).json({ message: "Missing required parameters: userId or intentUsername" });
      return;
    }
    if (intentUsername && typeof intentUsername === "object") {
      intentUsername = intentUsername[0];
    }
    const customerId = await getStripeCustomerIdFromUserId(userId);
    if (!customerId) {
      res.status(404).json({ message: "Missing customer id" });
      return;
    }

    const userData = await prisma.user.findFirst({
      where: { id: userId },
      select: { id: true, metadata: true },
    });
    if (!userData) {
      res.status(404).json({ message: "Missing user data" });
      return;
    }

    const return_url = `${WEBAPP_URL}/api/integrations/stripepayment/paymentCallback?checkoutSessionId={CHECKOUT_SESSION_ID}&callbackUrl=${callbackUrl}`;
    const createSessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price: getPremiumMonthlyPlanPriceId(),
        },
      ],
      allow_promotion_codes: true,
      customer: customerId,
      success_url: return_url,
      cancel_url: return_url,
      metadata: {
        userId: userId.toString(),
        intentUsername,
      },
    };

    const checkPremiumResult = await usernameCheck(intentUsername);
    if (!checkPremiumResult.available) {
      return res.status(404).json({ message: "Intent username not available" });
    }
    const stripeCustomer = await stripe.customers.retrieve(customerId);
    if (!stripeCustomer || stripeCustomer.deleted) {
      return res.status(400).json({ message: "Stripe customer not found or deleted" });
    }
    await stripe.customers.update(customerId, {
      metadata: {
        ...stripeCustomer.metadata,
        username: intentUsername,
      },
    });

    if (userData) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          metadata: {
            ...((userData.metadata as Prisma.JsonObject) || {}),
            isPremium: false,
          },
        },
      });
    }
    const checkoutSession = await stripe.checkout.sessions.create(createSessionParams);
    if (checkoutSession?.url) {
      return res.redirect(checkoutSession.url).end();
    }
    return res.status(404).json({ message: "Couldn't redirect to stripe checkout session" });
  }
}
```

<a id="finding-repository-health-complexity-transformlocationsinternaltoapi-51d63af3ff"></a>
## Critical complexity in transformLocationsInternalToApi

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/internal-to-api/locations.ts:49 has cyclomatic complexity 14, cognitive complexity 16, and maintainability 33.33.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-transformlocationsinternaltoapi-51d63af3ff"></a>
### Autofix

apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/internal-to-api/locations.ts L47-L145

Source: apps/api/v2/src/platform/event-types/event-types_2024_06_14/transformers/internal-to-api/locations.ts L47-L145

```typescript
};

export function transformLocationsInternalToApi(internalLocations: InternalLocation[] | undefined) {
  if (!internalLocations) {
    return [];
  }

  const apiLocations: OutputLocation_2024_06_14[] = [];

  for (const location of internalLocations) {
    switch (location.type) {
      case "inPerson": {
        if (!location.address) {
          continue;
        }
        const addressLocation: OutputAddressLocation_2024_06_14 = {
          type: "address",
          address: location.address,
          public: location.displayLocationPublicly,
        };
        apiLocations.push(addressLocation);
        break;
      }
      case "attendeeInPerson": {
        const attendeeAddressLocation: OutputAttendeeAddressLocation_2024_06_14 = {
          type: "attendeeAddress",
        };
        apiLocations.push(attendeeAddressLocation);
        break;
      }
      case "link": {
        if (!location.link) {
          continue;
        }
        const linkLocation: OutputLinkLocation_2024_06_14 = {
          type: "link",
          link: location.link,
          public: location.displayLocationPublicly,
        };
        apiLocations.push(linkLocation);
        break;
      }
      case "userPhone": {
        if (!location.hostPhoneNumber) {
          continue;
        }
        const phoneLocation: OutputPhoneLocation_2024_06_14 = {
          type: "phone",
          phone: location.hostPhoneNumber,
          public: location.displayLocationPublicly,
        };
        apiLocations.push(phoneLocation);
        break;
      }
      case "phone": {
        const attendeePhoneLocation: OutputAttendeePhoneLocation_2024_06_14 = {
          type: "attendeePhone",
        };
        apiLocations.push(attendeePhoneLocation);
        break;
      }
      case "somewhereElse": {
        const attendeeDefinedLocation: OutputAttendeeDefinedLocation_2024_06_14 = {
          type: "attendeeDefined",
        };
        apiLocations.push(attendeeDefinedLocation);
        break;
      }
      case "conferencing": {
        const conferencingLocation: OutputOrganizersDefaultAppLocation_2024_06_14 = {
          type: "organizersDefaultApp",
        };
        apiLocations.push(conferencingLocation);
        break;
      }
      default: {
        const integrationType = internalToApiIntegrationsMapping[location.type];
        if (!integrationType) {
          const unknown: OutputUnknownLocation_2024_06_14 = {
            type: "unknown",
            location: JSON.stringify(location),
          };
          apiLocations.push(unknown);
          break;
        }
        const integration: OutputIntegrationLocation_2024_06_14 = {
          type: "integration",
          integration: integrationType,
          link: location.link,
          credentialId: location.credentialId,
        };
        apiLocations.push(integration);
        break;
      }
    }
  }

  return apiLocations;
}
```

<a id="finding-repository-health-complexity-transformlocation-4f350d0d5a"></a>
## Critical complexity in transformLocation

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

apps/api/v2/src/platform/bookings/2024-08-13/services/input.service.ts:282 has cyclomatic complexity 14, cognitive complexity 16, and maintainability 34.73.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-transformlocation-4f350d0d5a"></a>
### Autofix

apps/api/v2/src/platform/bookings/2024-08-13/services/input.service.ts L280-L375

Source: apps/api/v2/src/platform/bookings/2024-08-13/services/input.service.ts L280-L375

```typescript
  }

  transformLocation(
    location: string | BookingInputLocation_2024_08_13 | UpdateBookingInputLocation_2024_08_13
  ): {
    value: string;
    optionValue: string;
  } {
    if (typeof location === "string") {
      // note(Lauris): this is for backwards compatibility because before switching to booking location objects
      // we only received a string. If someone is complaining that their location is not displaying as a URL
      // or whatever check that they are not providing a string for bookign location but one of the input objects.
      if (isURL(location, { require_protocol: false }) || location.startsWith("www.")) {
        return {
          value: "link",
          optionValue: location,
        };
      }

      if (isPhoneNumber(location)) {
        return {
          value: "phone",
          optionValue: location,
        };
      }

      return {
        value: "somewhereElse",
        optionValue: location,
      };
    }

    if (location.type === "integration") {
      const integration = apiToInternalintegrationsMapping[location.integration];
      if (!integration) {
        throw new BadRequestException(`Invalid integration: ${location.integration}`);
      }
      return {
        value: integration,
        optionValue: "",
      };
    }

    if (location.type === "address") {
      return {
        value: "inPerson",
        optionValue: "",
      };
    }

    if (location.type === "attendeeAddress") {
      return {
        value: "attendeeInPerson",
        optionValue: location.address,
      };
    }

    if (location.type === "link") {
      return {
        value: "link",
        optionValue: "",
      };
    }

    if (location.type === "phone") {
      return {
        value: "userPhone",
        optionValue: "",
      };
    }

    if (location.type === "organizersDefaultApp") {
      return {
        value: "conferencing",
        optionValue: "",
      };
    }

    if (location.type === "attendeePhone") {
      return {
        value: "phone",
        optionValue: location.phone,
      };
    }

    if (location.type === "attendeeDefined") {
      return {
        value: "somewhereElse",
        optionValue: location.location,
      };
    }

    throw new BadRequestException(
      `Booking location with type ${(location as BookingInputLocation_2024_08_13).type} not valid.`
    );
  }
```

<a id="finding-repository-health-complexity-getpubliceventtypeforatoms-151cb2589d"></a>
## Critical complexity in getPublicEventTypeForAtoms

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

apps/api/v2/src/modules/atoms/services/event-types-atom.service.ts:363 has cyclomatic complexity 13, cognitive complexity 19, and maintainability 37.15.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-getpubliceventtypeforatoms-151cb2589d"></a>
### Autofix

apps/api/v2/src/modules/atoms/services/event-types-atom.service.ts L361-L434

Source: apps/api/v2/src/modules/atoms/services/event-types-atom.service.ts L361-L434

```typescript
   * Returns the public event type for atoms, handling both team and user events.
   */
  async getPublicEventTypeForAtoms({
    username,
    eventSlug,
    isTeamEvent,
    orgId,
    teamId,
  }: {
    username?: string;
    eventSlug: string;
    isTeamEvent?: boolean;
    orgId?: number;
    teamId?: number;
  }): Promise<PublicEventType> {
    const orgSlug = orgId ? await this.getTeamSlug(orgId) : null;

    let usernameOrTeamSlug: string | null = null;
    if (isTeamEvent) {
      if (!teamId) {
        throw new BadRequestException("teamId is required for team events, please provide a valid teamId");
      }
      usernameOrTeamSlug = await this.getTeamSlug(teamId);
    } else {
      if (!username) {
        throw new BadRequestException(
          "username is required for non-team events, please provide a valid username"
        );
      }
      usernameOrTeamSlug = username;
    }

    usernameOrTeamSlug = usernameOrTeamSlug.toLowerCase();

    try {
      let event = await getPublicEvent(
        usernameOrTeamSlug,
        eventSlug,
        isTeamEvent,
        orgSlug,
        this.dbRead.prisma as unknown as PrismaClient,
        true
      );

      const usernamePossiblyNotFromProfile = username && orgId && !event;
      if (usernamePossiblyNotFromProfile) {
        const user = await this.usersRepository.findByUsernameWithProfile(username);
        if (user) {
          const profile = await this.usersService.getUserMainProfile(user);
          if (profile?.username) {
            event = await getPublicEvent(
              profile.username,
              eventSlug,
              isTeamEvent,
              orgSlug,
              this.dbRead.prisma as unknown as PrismaClient,
              true
            );
          }
        }
      }

      if (!event) {
        throw new NotFoundException(`Event type with slug ${eventSlug} not found`);
      }

      return event;
    } catch (err) {
      if (err instanceof Error) {
        throw new NotFoundException(err.message);
      }
      throw new NotFoundException(`Event type with slug ${eventSlug} not found`);
    }
  }
```

<a id="finding-repository-health-complexity-handler-ca648e6081"></a>
## Critical complexity in handler

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

apps/web/lib/pages/auth/verify-email.ts:28 has cyclomatic complexity 13, cognitive complexity 16, and maintainability 28.62.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-handler-ca648e6081"></a>
### Autofix

apps/web/lib/pages/auth/verify-email.ts L26-L162

Source: apps/web/lib/pages/auth/verify-email.ts L26-L162

```typescript
}

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = verifySchema.parse(req.query);

  const foundToken = await prisma.verificationToken.findFirst({
    where: {
      token,
    },
  });

  if (!foundToken) {
    return res.status(401).json({ message: "No token found" });
  }

  if (dayjs(foundToken?.expires).isBefore(dayjs())) {
    return res.status(401).json({ message: "Token expired" });
  }

  // The user is verifying the secondary email
  if (foundToken?.secondaryEmailId) {
    await prisma.secondaryEmail.update({
      where: {
        id: foundToken.secondaryEmailId,
        email: foundToken?.identifier,
      },
      data: {
        emailVerified: new Date(),
      },
    });

    await cleanUpVerificationTokens(foundToken.id);

    return res.redirect(`${WEBAPP_URL}/settings/my-account/profile`);
  }

  const user = await prisma.user.findFirst({
    where: {
      email: foundToken?.identifier,
    },
  });

  if (!user) {
    return res.status(401).json({ message: "Cannot find a user attached to this token" });
  }

  const userMetadataParsed = userMetadata.parse(user.metadata);
  // Attach the new email and verify
  if (userMetadataParsed?.emailChangeWaitingForVerification) {
    // Ensure this email isn't in use
    const existingUser = await prisma.user.findUnique({
      where: { email: userMetadataParsed?.emailChangeWaitingForVerification },
      select: {
        id: true,
      },
    });
    if (existingUser) {
      return res.status(401).json({ message: USER_ALREADY_EXISTING_MESSAGE });
    }

    // Ensure this email isn't being added by another user as secondary email
    const existingSecondaryUser = await prisma.secondaryEmail.findUnique({
      where: {
        email: userMetadataParsed?.emailChangeWaitingForVerification,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (existingSecondaryUser && existingSecondaryUser.userId !== user.id) {
      return res.status(401).json({ message: USER_ALREADY_EXISTING_MESSAGE });
    }

    const oldEmail = user.email;
    const updatedEmail = userMetadataParsed.emailChangeWaitingForVerification;
    delete userMetadataParsed.emailChangeWaitingForVerification;

    // Update and re-verify
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: updatedEmail,
        metadata: userMetadataParsed,
      },
    });

    if (IS_STRIPE_ENABLED && userMetadataParsed.stripeCustomerId) {
        const billingService = { updateCustomer: async (_args: { customerId: string; email: string }) => {} };
        await billingService.updateCustomer({
          customerId: userMetadataParsed.stripeCustomerId,
          email: updatedEmail,
        });
    }

    // The user is trying to update the email to an already existing unverified secondary email of his
    // so we swap the emails and its verified status
    if (existingSecondaryUser?.userId === user.id) {
      await prisma.secondaryEmail.update({
        where: {
          id: existingSecondaryUser.id,
          userId: user.id,
        },
        data: {
          email: oldEmail,
          emailVerified: user.emailVerified,
        },
      });
    }

    await cleanUpVerificationTokens(foundToken.id);

    return res.status(200).json({
      updatedEmail,
    });
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerified: new Date(),
    },
  });

  const hasCompletedOnboarding = user.completedOnboarding;

  await moveUserToMatchingOrg({ email: user.email });

  const gettingStartedPath = await OnboardingPathService.getGettingStartedPath();

  return res.redirect(`${WEBAPP_URL}${hasCompletedOnboarding ? "/event-types" : gettingStartedPath}`);
}
```

<a id="finding-repository-health-complexity-processpaymentrefund-06206cf991"></a>
## Critical complexity in processPaymentRefund

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/bookings/lib/payment/processPaymentRefund.ts:9 has cyclomatic complexity 13, cognitive complexity 16, and maintainability 36.19.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-processpaymentrefund-06206cf991"></a>
### Autofix

packages/features/bookings/lib/payment/processPaymentRefund.ts L7-L84

Source: packages/features/bookings/lib/payment/processPaymentRefund.ts L7-L84

```typescript
import { EventTypeMetaDataSchema } from "@calcom/prisma/zod-utils";

export const processPaymentRefund = async ({
  booking,
  teamId,
}: {
  booking: {
    startTime: Date;
    endTime: Date;
    payment: Payment[];
    eventType: {
      owner?: {
        id: number;
      } | null;
      metadata?: Prisma.JsonValue;
    } | null;
  };
  teamId?: number | null;
}) => {
  const { startTime, eventType, payment } = booking;
  if (!teamId && !eventType?.owner) return;

  const successPayment = payment.find((p) => p.success);
  if (!successPayment) return;

  const eventTypeMetadata = EventTypeMetaDataSchema.parse(eventType?.metadata);
  const appData = getPaymentAppData({
    currency: successPayment.currency,
    metadata: eventTypeMetadata,
    price: successPayment.amount,
  });

  if (!appData?.refundPolicy || appData.refundPolicy === RefundPolicy.NEVER) return;

  const credentialWhereClause: Prisma.CredentialFindManyArgs["where"] = {
    appId: successPayment.appId,
  };
  if (eventType?.owner) {
    credentialWhereClause.userId = eventType.owner.id;
  } else if (teamId) {
    credentialWhereClause.teamId = teamId;
  }

  const paymentAppCredentials = await prisma.credential.findMany({
    where: credentialWhereClause,
    select: {
      key: true,
      appId: true,
      app: {
        select: {
          categories: true,
          dirName: true,
        },
      },
    },
  });

  const paymentAppCredential = paymentAppCredentials.find((credential) => {
    return credential.appId === successPayment.appId;
  });

  if (!paymentAppCredential) return;

  const { refundPolicy, refundCountCalendarDays, refundDaysCount } = appData;

  //refundDaysCount would always be present in case DAYS is selected, but adding it in AND jut for type safety
  if (refundPolicy === RefundPolicy.DAYS && refundDaysCount) {
    const refundDeadline =
      refundCountCalendarDays === true
        ? dayjs(startTime).subtract(refundDaysCount, "days")
        : // businessDaysSubtract exists on extended dayjs instance, but ts is messing up
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          dayjs(startTime).businessDaysSubtract(refundDaysCount);
    if (dayjs().isAfter(refundDeadline)) return;
  }
  await handlePaymentRefund(successPayment.id, paymentAppCredential);
};
```

<a id="finding-repository-health-complexity-main-88b488f1c0"></a>
## Critical complexity in main

Severity: Critical
Classification: Code health
Language: JavaScript
Framework: Code health

scripts/prepare-local-for-delegation-credentials-testing.js:9 has cyclomatic complexity 12, cognitive complexity 22, and maintainability 29.32.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-main-88b488f1c0"></a>
### Autofix

scripts/prepare-local-for-delegation-credentials-testing.js L7-L133

Source: scripts/prepare-local-for-delegation-credentials-testing.js L7-L133

```javascript
const prisma = new PrismaClient();

async function main() {
  // Dynamic import for ES module
  const { FeaturesRepository } = await import("@calcom/features/flags/features.repository");
  const featuresRepository = new FeaturesRepository(prisma);
  // Parse newEmail from args
  const newEmail = process.argv[2] || "hariom@cal.com";
  console.log(`Using newEmail: ${newEmail}`);

  // 1. Update user email
  let user = await prisma.user.findUnique({
    where: { email: "owner1-acme@example.com" },
  });
  if (!user) {
    // Check if user with newEmail exists
    user = await prisma.user.findUnique({ where: { email: newEmail } });
    if (user) {
      console.log(`User with newEmail (${newEmail}) already exists. Skipping email update step.`);
    } else {
      console.error(
        "User with email owner1-acme@example.com not found, and user with newEmail also not found."
      );
      process.exit(1);
    }
  } else {
    if (user.email !== newEmail) {
      await prisma.user.update({
        where: { id: user.id },
        data: { email: newEmail },
      });
      console.log(`Updated user email to ${newEmail}`);
    } else {
      console.log("User email already set to newEmail, skipping update.");
    }
  }

  // 2. Find organization (Team)
  const org = await prisma.team.findFirst({
    where: { slug: "acme", isOrganization: true },
  });
  if (!org) {
    console.error("Organization (Team) with slug=acme and isOrganization=true not found.");
    process.exit(1);
  }
  console.log(`Found organization: id=${org.id}, slug=${org.slug}`);

  // 3. Ensure TeamFeatures: delegation-credential
  const delegationFeature = await prisma.teamFeatures.findUnique({
    where: {
      teamId_featureId: {
        teamId: org.id,
        featureId: "delegation-credential",
      },
      enabled: true,
    },
  });
  if (!delegationFeature) {
    await featuresRepository.setTeamFeatureState({
      teamId: org.id,
      featureId: "delegation-credential",
      state: "enabled",
      assignedBy: "prepare-local-script",
    });
    console.log("Created TeamFeatures: delegation-credential");
  } else {
    console.log("TeamFeatures: delegation-credential already exists, skipping.");
  }

  // 4. Ensure TeamFeatures: calendar-cache
  const calendarCacheFeature = await prisma.teamFeatures.findUnique({
    where: {
      teamId_featureId: {
        teamId: org.id,
        featureId: "calendar-cache",
      },
      enabled: true,
    },
  });
  if (!calendarCacheFeature) {
    await featuresRepository.setTeamFeatureState({
      teamId: org.id,
      featureId: "calendar-cache",
      state: "enabled",
      assignedBy: "prepare-local-script",
    });
    console.log("Created TeamFeatures: calendar-cache");
  } else {
    console.log("TeamFeatures: calendar-cache already exists, skipping.");
  }

  // 5. Add WorkspacePlatform record
  const workspacePlatform = await prisma.workspacePlatform.findUnique({
    where: { slug: "google" },
  });
  if (!workspacePlatform) {
    await prisma.workspacePlatform.create({
      data: {
        slug: "google",
        name: "Google",
        enabled: true,
        description: "Google Workspace Platform",
        defaultServiceAccountKey: {}, // Empty object, update as needed
      },
    });
    console.log("Created WorkspacePlatform: google");
  } else {
    console.log("WorkspacePlatform: google already exists, skipping.");
  }

  // 6. Enable Feature records for 'calendar-cache' and 'delegation-credential'
  const featureSlugs = ["calendar-cache", "delegation-credential"];
  for (const slug of featureSlugs) {
    const feature = await prisma.feature.findUnique({ where: { slug } });
    if (!feature) {
      console.error(`Feature with slug ${slug} not found.`);
      process.exit(1);
    }
    if (!feature.enabled) {
      await prisma.feature.update({ where: { slug }, data: { enabled: true } });
      console.log(`Enabled Feature: ${slug}`);
    } else {
      console.log(`Feature: ${slug} already enabled, skipping.`);
    }
  }
  console.log(`Now you can sign in with ${newEmail} and create a new Delegation Credential.`);
}
```

<a id="finding-repository-health-complexity-chargecard-ab0958bd39"></a>
## Critical complexity in chargeCard

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/app-store/stripepayment/lib/PaymentService.ts:227 has cyclomatic complexity 12, cognitive complexity 17, and maintainability 31.09.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-chargecard-ab0958bd39"></a>
### Autofix

packages/app-store/stripepayment/lib/PaymentService.ts L225-L330

Source: packages/app-store/stripepayment/lib/PaymentService.ts L225-L330

```typescript
  }

  async chargeCard(payment: Payment, bookingId: Booking["id"]): Promise<Payment> {
    try {
      if (!this.credentials) {
        throw new Error("Stripe credentials not found");
      }

      const bookingRepository = new BookingRepository(prisma);
      const booking = await bookingRepository.findByIdIncludeUserAndAttendees(bookingId);

      if (!booking) {
        throw new Error(`Booking ${bookingId} not found`);
      }

      const paymentObject = payment.data as unknown as StripeSetupIntentData;

      const setupIntent = paymentObject.setupIntent;

      // Ensure that the stripe customer & payment method still exists
      const customer = await this.stripe.customers.retrieve(setupIntent.customer as string, {
        stripeAccount: this.credentials.stripe_user_id,
      });
      const paymentMethod = await this.stripe.paymentMethods.retrieve(setupIntent.payment_method as string, {
        stripeAccount: this.credentials.stripe_user_id,
      });

      if (!customer) {
        throw new Error(`Stripe customer does not exist for setupIntent ${setupIntent.id}`);
      }

      if (!paymentMethod) {
        throw new Error(`Stripe paymentMethod does not exist for setupIntent ${setupIntent.id}`);
      }

      if (!booking.attendees[0]) {
        throw new Error(`Booking attendees are empty for setupIntent ${setupIntent.id}`);
      }

      const params: Stripe.PaymentIntentCreateParams = {
        amount: payment.amount,
        currency: payment.currency,
        customer: setupIntent.customer as string,
        payment_method: setupIntent.payment_method as string,
        off_session: true,
        confirm: true,
        metadata: this.generateMetadata({
          bookingId,
          userId: booking.user?.id,
          username: booking.user?.username,
          bookerName: booking.attendees[0].name,
          bookerEmail: booking.attendees[0].email,
          bookerPhoneNumber: booking.attendees[0].phoneNumber ?? null,
          eventTitle: booking.eventType?.title || null,
          bookingTitle: booking.title,
        }),
      };

      const paymentIntent = await this.stripe.paymentIntents.create(params, {
        stripeAccount: this.credentials.stripe_user_id,
      });

      const paymentData = await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          success: true,
          data: {
            ...paymentObject,
            paymentIntent,
          } as unknown as Prisma.InputJsonValue,
        },
      });

      if (!paymentData) {
        throw new Error();
      }

      return paymentData;
    } catch (error) {
      log.error("Stripe: Could not charge card for payment", bookingId, safeStringify(error));

      const errorMappings = {
        "your card was declined": "your_card_was_declined",
        "your card does not support this type of purchase":
          "your_card_does_not_support_this_type_of_purchase",
        "amount must convert to at least": "amount_must_convert_to_at_least",
      };

      let userMessage = "could_not_charge_card";

      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        for (const [key, message] of Object.entries(errorMappings)) {
          if (errorMessage.includes(key)) {
            userMessage = message;
            break;
          }
        }
      }

      throw new ErrorWithCode(ErrorCode.ChargeCardFailure, userMessage);
    }
  }
```

<a id="finding-repository-health-complexity-getconnecteddestinationcalendarsandensuredefaultsindb-64fa06b5af"></a>
## Critical complexity in getConnectedDestinationCalendarsAndEnsureDefaultsInDb

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/calendars/lib/getConnectedDestinationCalendars.ts:275 has cyclomatic complexity 10, cognitive complexity 23, and maintainability 27.97.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-getconnecteddestinationcalendarsandensuredefaultsindb-64fa06b5af"></a>
### Autofix

packages/features/calendars/lib/getConnectedDestinationCalendars.ts L273-L438

Source: packages/features/calendars/lib/getConnectedDestinationCalendars.ts L273-L438

```typescript
 * It also takes care of updating the destination calendar in some edge cases
 */
export async function getConnectedDestinationCalendarsAndEnsureDefaultsInDb({
  user,
  onboarding,
  eventTypeId,
  prisma,
  skipSync,
}: {
  user: UserWithCalendars;
  onboarding: boolean;
  eventTypeId?: number | null;
  prisma: PrismaClient;
  skipSync?: boolean;
}): Promise<{
  destinationCalendar: DestinationCalendar & Omit<IntegrationCalendar, "id" | "userId">;
  connectedCalendars: Awaited<ReturnType<typeof getConnectedCalendars>>["connectedCalendars"];
}> {
  const userCredentials = await prisma.credential.findMany({
    where: {
      userId: user.id,
      app: {
        categories: { has: AppCategories.calendar },
        enabled: true,
      },
    },
    select: {
      selectedCalendars: {
        select: {
          id: true,
        },
      },
      ...credentialForCalendarServiceSelect,
    },
  });

  const selectedCalendars = getSelectedCalendars({ user, eventTypeId: eventTypeId ?? null });
  let connectedCalendars: Awaited<ReturnType<typeof getConnectedCalendars>>["connectedCalendars"] = [];
  let destinationCalendar: IntegrationCalendar | undefined;

  const { credentials: allCredentials } = await enrichUserWithDelegationCredentialsIncludeServiceAccountKey({
    user: { id: user.id, email: user.email, credentials: userCredentials },
  });
  // get user's credentials + their connected integrations
  const calendarCredentials = getCalendarCredentials(allCredentials);

  if (!skipSync) {
    // get all the connected integrations' calendars (from third party)
    const getConnectedCalendarsResult = await getConnectedCalendars(
      calendarCredentials,
      selectedCalendars,
      user.destinationCalendar?.externalId
    );

    connectedCalendars = getConnectedCalendarsResult.connectedCalendars;
    destinationCalendar = getConnectedCalendarsResult.destinationCalendar;

    let calendarToEnsureIsEnabledForConflictCheck: ToggledCalendarDetails | null = null;

    if (connectedCalendars.length === 0) {
      user = await handleNoConnectedCalendars(user);
    } else if (!user.destinationCalendar) {
      ({ user, calendarToEnsureIsEnabledForConflictCheck, connectedCalendars } =
        await handleNoDestinationCalendar({
          user,
          connectedCalendars,
          onboarding,
        }));
    } else {
      /* There are connected calendars and a destination calendar */
      log.debug(
        `There are connected calendars and a destination calendar, so check if destinationCalendar exists in connectedCalendars for user ${user.id}`
      );

      const destinationCal = findMatchingCalendar({ connectedCalendars, calendar: user.destinationCalendar });
      if (!destinationCal) {
        ({ user, calendarToEnsureIsEnabledForConflictCheck, connectedCalendars } =
          await handleDestinationCalendarNotInConnectedCalendars({
            user,
            connectedCalendars,
            onboarding,
          }));
      } else if (onboarding && !destinationCal.isSelected) {
        log.debug(
          `Onboarding:Destination calendar is not selected, but in connectedCalendars, so mark it as selected in the calendar list for user ${user.id}`
        );
        // Mark the destination calendar as selected in the calendar list
        // We use every so that we can exit early once we find the matching calendar
        connectedCalendars.every((cal) => {
          const index = (cal.calendars || []).findIndex(
            (calendar) =>
              calendar.externalId === destinationCal.externalId &&
              calendar.integration === destinationCal.integration
          );
          if (index >= 0 && cal.calendars) {
            cal.calendars[index].isSelected = true;
            calendarToEnsureIsEnabledForConflictCheck = {
              externalId: destinationCal.externalId,
              integration: destinationCal.integration || "",
            };
            return false;
          }

          return true;
        });
      }
    }

    // Insert the newly toggled record to the DB
    if (calendarToEnsureIsEnabledForConflictCheck) {
      await ensureSelectedCalendarIsInDb({
        user,
        selectedCalendar: calendarToEnsureIsEnabledForConflictCheck,
        eventTypeId: eventTypeId ?? null,
      });
    }
  }
  // very explicit about skipping sync.
  if (skipSync) {
    // TODO: Make calendar types more flexible so this isn't needed
    calendarCredentials.map(async (item) => {
      const { integration } = item;
      // TODO: Make calendar types more flexible somehow so this isn't needed
      const credential: typeof item.credential & { selectedCalendars: { id: string }[] } =
        item.credential as CredentialDataWithTeamName & { selectedCalendars: { id: string }[] };

      const safeToSendIntegration = cleanIntegrationKeys(integration);
      connectedCalendars.push({
        integration: safeToSendIntegration,
        credentialId: credential.id,
        delegationCredentialId: credential.delegationCredentialId,
        calendars: selectedCalendars
          .filter((cal) =>
            credential.selectedCalendars.some((appSelectedCal) => appSelectedCal.id === cal.id)
          )
          .map((cal) => ({
            ...cal,
            isSelected: true,
            readOnly: false,
            primary: null,
            credentialId: credential.id,
            delegationCredentialId: credential.delegationCredentialId,
          })),
      });
    });
  }

  const noConflictingNonDelegatedConnectedCalendars = _ensureNoConflictingNonDelegatedConnectedCalendar({
    connectedCalendars,
    loggedInUser: { email: user.email },
  });
  let destinationCalendarWithoutIdAndUserId: Omit<IntegrationCalendar, "id" | "userId"> | null = null;
  if (destinationCalendar) {
    // ID and userID will be provided by user.destinationCalendar
    const { id: _id, userId: _userId, ...partialDestCal } = destinationCalendar;
    destinationCalendarWithoutIdAndUserId = partialDestCal;
  }
  return {
    connectedCalendars: noConflictingNonDelegatedConnectedCalendars,
    destinationCalendar: {
      // biome-ignore lint/style/noNonNullAssertion: destinationCalendar is guaranteed to be non null here
      ...user.destinationCalendar!,
      ...destinationCalendarWithoutIdAndUserId,
    },
  };
}
```

<a id="finding-repository-health-complexity-findqualifiedhostswithdelegationcredentials-5cee6a9688"></a>
## Critical complexity in findQualifiedHostsWithDelegationCredentials

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

apps/api/v2/src/lib/services/qualified-hosts.service.ts:23 has cyclomatic complexity 10, cognitive complexity 22, and maintainability 38.08.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-findqualifiedhostswithdelegationcredentials-5cee6a9688"></a>
### Autofix

apps/api/v2/src/lib/services/qualified-hosts.service.ts L21-L85

Source: apps/api/v2/src/lib/services/qualified-hosts.service.ts L21-L85

```typescript
  }

  async findQualifiedHostsWithDelegationCredentials(...args: unknown[]): Promise<{
    qualifiedRRHosts: QualifiedHost[];
    allFallbackRRHosts: QualifiedHost[];
    fixedHosts: QualifiedHost[];
  }> {
    const input = (args[0] ?? {}) as Record<string, unknown>;
    const eventType = (input.eventType ?? {}) as Record<string, unknown>;
    const contactOwnerEmail = input.contactOwnerEmail as string | null | undefined;
    const routedTeamMemberIds = (input.routedTeamMemberIds ?? []) as number[];

    const hosts = (eventType.hosts ?? []) as Host[];
    const users = (eventType.users ?? []) as User[];
    const schedulingType = eventType.schedulingType as string | null | undefined;

    if (hosts.length > 0) {
      const fixedHosts: QualifiedHost[] = [];
      const allRRHosts: QualifiedHost[] = [];

      for (const host of hosts) {
        const qualifiedHost: QualifiedHost = {
          user: host.user,
          isFixed: host.isFixed,
          groupId: host.groupId ?? null,
        };

        if (host.isFixed || schedulingType !== "ROUND_ROBIN") {
          fixedHosts.push(qualifiedHost);
        } else {
          allRRHosts.push(qualifiedHost);
        }
      }

      let qualifiedRRHosts = allRRHosts;

      if (contactOwnerEmail) {
        const contactOwnerHost = allRRHosts.filter(
          (h) => (h.user as { email?: string }).email === contactOwnerEmail
        );
        if (contactOwnerHost.length > 0) {
          qualifiedRRHosts = contactOwnerHost;
        }
      } else if (routedTeamMemberIds.length > 0) {
        const routedMemberIdSet = new Set(routedTeamMemberIds);
        const routedHosts = allRRHosts.filter((h) => routedMemberIdSet.has((h.user as { id: number }).id));
        if (routedHosts.length > 0) {
          qualifiedRRHosts = routedHosts;
        }
      }

      return { qualifiedRRHosts, allFallbackRRHosts: allRRHosts, fixedHosts };
    }

    if (users.length > 0) {
      const fixedHosts = users.map((user) => ({
        user,
        isFixed: true as const,
        groupId: null,
      }));
      return { qualifiedRRHosts: [], allFallbackRRHosts: [], fixedHosts };
    }

    return { qualifiedRRHosts: [], allFallbackRRHosts: [], fixedHosts: [] };
  }
```

<a id="finding-repository-health-complexity-intersect-47fdb8081c"></a>
## Critical complexity in intersect

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/schedules/lib/date-ranges.ts:354 has cyclomatic complexity 10, cognitive complexity 22, and maintainability 38.48.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-intersect-47fdb8081c"></a>
### Autofix

packages/features/schedules/lib/date-ranges.ts L352-L416

Source: packages/features/schedules/lib/date-ranges.ts L352-L416

```typescript
}

export function intersect(ranges: DateRange[][]): DateRange[] {
  if (!ranges.length) {
    return [];
  }

  type ProcessedDateRange = DateRange & { startValue: number; endValue: number };

  // Pre-sort all user ranges and cache timestamp values.
  const sortedRanges: ProcessedDateRange[][] = ranges.map((userRanges) =>
    userRanges
      .map((r) => ({
        ...r,
        startValue: r.start.valueOf(),
        endValue: r.end.valueOf(),
      }))
      .sort((a, b) => a.startValue - b.startValue)
  );

  let commonAvailability: ProcessedDateRange[] = sortedRanges[0];

  for (let i = 1; i < sortedRanges.length; i++) {
    // Early exit if no common availability is left.
    if (commonAvailability.length === 0) {
      return [];
    }

    const userRanges = sortedRanges[i];
    const intersectedRanges: ProcessedDateRange[] = [];

    let commonIndex = 0;
    let userIndex = 0;

    while (commonIndex < commonAvailability.length && userIndex < userRanges.length) {
      const commonRange = commonAvailability[commonIndex];
      const userRange = userRanges[userIndex];

      const intersectStartValue = Math.max(commonRange.startValue, userRange.startValue);
      const intersectEndValue = Math.min(commonRange.endValue, userRange.endValue);

      if (intersectStartValue < intersectEndValue) {
        const intersectStart =
          commonRange.startValue > userRange.startValue ? commonRange.start : userRange.start;
        const intersectEnd = commonRange.endValue < userRange.endValue ? commonRange.end : userRange.end;
        intersectedRanges.push({
          start: intersectStart,
          end: intersectEnd,
          startValue: intersectStartValue,
          endValue: intersectEndValue,
        });
      }

      if (commonRange.endValue <= userRange.endValue) {
        commonIndex++;
      } else {
        userIndex++;
      }
    }
    commonAvailability = intersectedRanges;
  }

  // Strip the cached values before returning to match the expected DateRange[] type.
  return commonAvailability.map(({ start, end }) => ({ start, end }));
}
```

<a id="finding-repository-health-complexity-addhoststodb-aa1609363a"></a>
## Critical complexity in addHostsToDb

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/testing/src/lib/bookingScenario/bookingScenario.ts:316 has cyclomatic complexity 8, cognitive complexity 16, and maintainability 39.28.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-addhoststodb-aa1609363a"></a>
### Autofix

packages/testing/src/lib/bookingScenario/bookingScenario.ts L314-L378

Source: packages/testing/src/lib/bookingScenario/bookingScenario.ts L314-L378

```typescript
};

async function addHostsToDb(eventTypes: InputEventType[]) {
  for (const eventType of eventTypes) {
    // Create host groups first if they exist
    if (eventType.hostGroups?.length) {
      await prismock.hostGroup.createMany({
        data: eventType.hostGroups.map((group) => ({
          id: group.id, // Preserve the input ID
          name: group.name,
          eventTypeId: eventType.id,
        })),
      });
    }

    if (!eventType.hosts?.length) continue;
    for (const host of eventType.hosts) {
      const data: Prisma.HostCreateInput = {
        eventType: {
          connect: {
            id: eventType.id,
          },
        },
        isFixed: host.isFixed ?? false,
        user: {
          connect: {
            id: host.userId,
          },
        },
        schedule: host.scheduleId
          ? {
              connect: {
                id: host.scheduleId,
              },
            }
          : undefined,
        group: host.groupId
          ? {
              connect: {
                id: host.groupId,
              },
            }
          : undefined,
      };

      await prismock.host.create({
        data,
      });

      if (host.location) {
        await prismock.hostLocation.create({
          data: {
            userId: host.userId,
            eventTypeId: eventType.id,
            type: host.location.type,
            credentialId: host.location.credentialId ?? null,
            link: host.location.link ?? null,
            address: host.location.address ?? null,
            phoneNumber: host.location.phoneNumber ?? null,
          },
        });
      }
    }
  }
}
```

<a id="finding-repository-health-complexity-fetchbookingsfromwebhook-c6b66e7bb1"></a>
## Critical complexity in fetchBookingsFromWebhook

Severity: Critical
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/webhooks/lib/scheduleTrigger.ts:384 has cyclomatic complexity 6, cognitive complexity 16, and maintainability 34.7.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-fetchbookingsfromwebhook-c6b66e7bb1"></a>
### Autofix

packages/features/webhooks/lib/scheduleTrigger.ts L382-L477

Source: packages/features/webhooks/lib/scheduleTrigger.ts L382-L477

```typescript
);

async function fetchBookingsFromWebhook(
  webhook: Pick<Webhook, "id" | "userId" | "teamId" | "eventTypeId">
): Promise<Booking[]> {
  const currentTime = new Date();
  const where: Prisma.BookingWhereInput = {
    AND: [{ status: BookingStatus.ACCEPTED }],
    OR: [{ startTime: { gt: currentTime }, endTime: { gt: currentTime } }],
  };

  let bookings: Booking[] = [];

  if (Array.isArray(where.AND)) {
    if (webhook.teamId) {
      const org = await prisma.team.findFirst({
        where: {
          id: webhook.teamId,
          isOrganization: true,
        },
        select: {
          id: true,
          children: {
            select: {
              id: true,
            },
          },
          members: {
            select: {
              userId: true,
            },
          },
        },
      });
      // checking if teamId is an org id
      if (org) {
        const teamEvents = await prisma.eventType.findMany({
          where: {
            teamId: {
              in: org.children.map((team) => team.id),
            },
          },
          select: {
            bookings: {
              where,
            },
          },
        });
        const teamEventBookings = teamEvents.flatMap((event) => event.bookings);
        const teamBookingsId = teamEventBookings.map((booking) => booking.id);
        const orgMemberIds = org.members.map((member) => member.userId);
        where.AND.push({
          userId: {
            in: orgMemberIds,
          },
        });
        // don't want to get the team bookings again
        where.AND.push({
          id: {
            notIn: teamBookingsId,
          },
        });
        const userBookings = await prisma.booking.findMany({
          where,
        });
        // add teams bookings and users bookings to get total org bookings
        bookings = teamEventBookings.concat(userBookings);
      } else {
        const teamEvents = await prisma.eventType.findMany({
          where: {
            teamId: webhook.teamId,
          },
          select: {
            bookings: {
              where,
            },
          },
        });

        bookings = teamEvents.flatMap((event) => event.bookings);
      }
    } else {
      if (webhook.eventTypeId) {
        where.AND.push({ eventTypeId: webhook.eventTypeId });
      } else if (webhook.userId) {
        where.AND.push({ userId: webhook.userId });
      }

      bookings = await prisma.booking.findMany({
        where,
      });
    }
  }

  return bookings;
}
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-1cb0f406ad"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/components/apps/installation/AccountsStepCard.tsx:81 — <AccountSelector> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-1cb0f406ad"></a>
### Autofix

apps/web/components/apps/installation/AccountsStepCard.tsx L79-L104

Source: apps/web/components/apps/installation/AccountsStepCard.tsx L79-L104

```typescript
      <div className="text-subtle text-sm font-medium">{t("install_app_on")}</div>
      <div className={classNames("mt-2 flex flex-col gap-2 ")}>
        <AccountSelector
          testId="install-app-button-personal"
          avatar={personalAccount.avatarUrl ?? ""}
          name={personalAccount.name ?? ""}
          alreadyInstalled={personalAccount.alreadyInstalled}
          onClick={() => onSelect()}
          loading={loading}
        />
        {installableOnTeams &&
          teams?.map((team) => (
            <AccountSelector
              key={team.id}
              testId={`install-app-button-team${team.id}`}
              alreadyInstalled={team.alreadyInstalled}
              avatar={team.logoUrl ?? ""}
              name={team.name}
              onClick={() => onSelect(team.id)}
              loading={loading}
            />
          ))}
      </div>
    </StepCard>
  );
};
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-8a515ce34d"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/components/apps/installation/ConfigureStepCard.tsx:108 — <Icon> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-8a515ce34d"></a>
### Autofix

apps/web/components/apps/installation/ConfigureStepCard.tsx L106-L132

Source: apps/web/components/apps/installation/ConfigureStepCard.tsx L106-L132

```typescript
              <EventTypeAppSettingsWrapper {...props} />
            )}
            <Icon
              name="x"
              data-testid={`remove-event-type-${eventType.id}`}
              className="absolute right-4 top-4 h-4 w-4 cursor-pointer"
              onClick={() => !loading && handleDelete()}
            />
            <button type="submit" className="hidden" form={`eventtype-${eventType.id}`} ref={ref}>
              Save
            </button>
          </div>
        </div>
      </Form>
    );
  }
);

const EventTypeGroup = ({
  groupIndex,
  eventTypeGroups,
  setUpdatedEventTypesStatus,
  submitRefs,
  ...props
}: ConfigureStepCardProps & {
  groupIndex: number;
  setUpdatedEventTypesStatus: Dispatch<SetStateAction<TUpdatedEventTypesStatus>>;
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-f845552ae8"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/components/booking/actions/BookingActionsDropdown.tsx:653 — <DropdownItem> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-f845552ae8"></a>
### Autofix

apps/web/components/booking/actions/BookingActionsDropdown.tsx L651-L674

Source: apps/web/components/booking/actions/BookingActionsDropdown.tsx L651-L674

```typescript
                key={cancelEventAction.id}
                disabled={cancelEventAction.disabled}>
                <DropdownItem
                  type="button"
                  color={cancelEventAction.color}
                  StartIcon={cancelEventAction.icon}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCancelDialogOpen(true);
                  }}
                  disabled={cancelEventAction.disabled}
                  data-booking-uid={cancelEventAction.bookingUid}
                  data-testid={cancelEventAction.id}
                  className={cancelEventAction.disabled ? "text-muted" : undefined}>
                  {cancelEventAction.label}
                </DropdownItem>
              </DropdownMenuItem>
            </Tooltip>
          </DropdownMenuContent>
        </ConditionalPortal>
      </Dropdown>
    </>
  );
}
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-447b26a39d"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/components/booking/BookingListItem.tsx:295 — <ConditionalLink> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-447b26a39d"></a>
### Autofix

apps/web/components/booking/BookingListItem.tsx L293-L319

Source: apps/web/components/booking/BookingListItem.tsx L293-L319

```typescript
          <div className="flex h-full items-center">
            {eventTypeColor && <div className="h-[70%] w-0.5" style={{ backgroundColor: eventTypeColor }} />}
            <ConditionalLink onClick={onClick} bookingLink={bookingLink} className="ml-3">
              <div className="cursor-pointer py-4">
                <div className="text-emphasis text-sm leading-6">{startTime}</div>
                <div className="text-subtle text-sm">
                  {formatTime(booking.startTime, userTimeFormat, userTimeZone)} -{" "}
                  {formatTime(booking.endTime, userTimeFormat, userTimeZone)}
                  <MeetingTimeInTimezones
                    timeFormat={userTimeFormat}
                    userTimezone={userTimeZone}
                    startTime={booking.startTime}
                    endTime={booking.endTime}
                    attendees={booking.attendees}
                  />
                </div>
                {!isPending && (
                  <div>
                    {(provider?.label ||
                      (typeof locationToDisplay === "string" && locationToDisplay?.startsWith("https://"))) &&
                      locationToDisplay.startsWith("http") && (
                        <a
                          href={locationToDisplay}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          title={locationToDisplay}
                          rel="noreferrer"
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-7e474b6d7e"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/components/booking/BookingListItem.tsx:347 — <ConditionalLink> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-7e474b6d7e"></a>
### Autofix

apps/web/components/booking/BookingListItem.tsx L345-L371

Source: apps/web/components/booking/BookingListItem.tsx L345-L371

```typescript
          data-testid="title-and-attendees"
          className={classNames("flex-1 px-4", isRejected && "line-through")}>
          <ConditionalLink onClick={onClick} bookingLink={bookingLink} className="flex h-full flex-col">
            {/* Time and Badges for mobile */}
            <div className="w-full pb-2 pt-4 sm:hidden">
              <div className="flex w-full items-center justify-between sm:hidden">
                <div className="text-emphasis text-sm leading-6">{startTime}</div>
                <div className="text-subtle pr-2 text-sm">
                  {formatTime(booking.startTime, userTimeFormat, userTimeZone)} -{" "}
                  {formatTime(booking.endTime, userTimeFormat, userTimeZone)}
                  <MeetingTimeInTimezones
                    timeFormat={userTimeFormat}
                    userTimezone={userTimeZone}
                    startTime={booking.startTime}
                    endTime={booking.endTime}
                    attendees={booking.attendees}
                  />
                </div>
              </div>

              {isPending && (
                <Badge className="ltr:mr-2 rtl:ml-2 sm:hidden" variant="orange">
                  {t("unconfirmed")}
                </Badge>
              )}
              {booking.eventType?.team && (
                <Badge className="ltr:mr-2 rtl:ml-2 sm:hidden" variant="gray">
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-e273c4d504"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/components/booking/BookingListItem.tsx:827 — <DropdownItem> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-e273c4d504"></a>
### Autofix

apps/web/components/booking/BookingListItem.tsx L825-L851

Source: apps/web/components/booking/BookingListItem.tsx L825-L851

```typescript

          <DropdownMenuItem className="focus:outline-none">
            <DropdownItem
              StartIcon={isCopied ? "clipboard-check" : "clipboard"}
              onClick={(e) => {
                e.preventDefault();
                const isEmailCopied = isSmsCalEmail(email);
                copyToClipboard(isEmailCopied ? email : (phoneNumber ?? ""));
                setOpenDropdown(false);
                showToast(isEmailCopied ? t("email_copied") : t("phone_number_copied"), "success");
              }}>
              {!isCopied ? t("copy") : t("copied")}
            </DropdownItem>
          </DropdownMenuItem>

          {isBookingInPast && (
            <DropdownMenuItem className="focus:outline-none">
              <DropdownItem
                data-testid={noShow ? "unmark-no-show" : "mark-no-show"}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDropdown(false);
                  noShowMutation.mutate({ bookingUid, attendees: [{ noShow: !noShow, email }] });
                }}
                StartIcon={noShow ? "eye" : "eye-off"}>
                {noShow ? t("unmark_as_no_show") : t("mark_as_no_show")}
              </DropdownItem>
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-d900f5da51"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/components/booking/BookingListItem.tsx:1138 — <Badge> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-d900f5da51"></a>
### Autofix

apps/web/components/booking/BookingListItem.tsx L1136-L1157

Source: apps/web/components/booking/BookingListItem.tsx L1136-L1157

```typescript
  return (
    <Tooltip content={<p>{assignmentReason.reasonString}</p>}>
      <Badge
        className={classNames("ltr:mr-2 rtl:ml-2", onClick && "cursor-pointer hover:opacity-80")}
        variant="gray"
        onClick={onClick}>
        {t(badgeTitle)}
      </Badge>
    </Tooltip>
  );
};

// Wrap BookingListItem with BookingActionsStoreProvider to provide isolated store for each booking
const BookingListItemWithProvider = (props: BookingItemProps) => {
  return (
    <BookingActionsStoreProvider>
      <BookingListItem {...props} />
    </BookingActionsStoreProvider>
  );
};

export default BookingListItemWithProvider;
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-16d7b9b88c"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/components/settings/CustomEmailTextField.tsx:83 — <DropdownItem> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-16d7b9b88c"></a>
### Autofix

apps/web/components/settings/CustomEmailTextField.tsx L81-L107

Source: apps/web/components/settings/CustomEmailTextField.tsx L81-L107

```typescript
            <DropdownMenuContent>
              <DropdownMenuItem>
                <DropdownItem
                  StartIcon="flag"
                  color="secondary"
                  className="disabled:opacity-40"
                  onClick={handleChangePrimary}
                  disabled={!emailVerified || emailPrimary}
                  data-testid="secondary-email-make-primary-button">
                  {t("make_primary")}
                </DropdownItem>
              </DropdownMenuItem>
              {!emailVerified && (
                <DropdownMenuItem>
                  <DropdownItem
                    StartIcon="send"
                    color="secondary"
                    className="disabled:opacity-40"
                    onClick={handleVerifyEmail}
                    disabled={emailVerified}
                    data-testid="resend-verify-email-button">
                    {t("resend_email")}
                  </DropdownItem>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <DropdownItem
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-2e38d7bcac"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/components/settings/CustomEmailTextField.tsx:107 — <DropdownItem> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-2e38d7bcac"></a>
### Autofix

apps/web/components/settings/CustomEmailTextField.tsx L105-L126

Source: apps/web/components/settings/CustomEmailTextField.tsx L105-L126

```typescript
              )}
              <DropdownMenuItem>
                <DropdownItem
                  StartIcon="trash"
                  color="destructive"
                  className="rounded-t-none disabled:opacity-40"
                  onClick={handleItemDelete}
                  disabled={emailPrimary}
                  data-testid="secondary-email-delete-button">
                  {t("delete")}
                </DropdownItem>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </Dropdown>
        </div>
      </div>
      {errorMessage && <InputError message={errorMessage} />}
    </>
  );
};

export default CustomEmailTextField;
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-d5446cf7ed"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/components/settings/SecondaryEmailConfirmModal.tsx:22 — <DialogClose> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-d5446cf7ed"></a>
### Autofix

apps/web/components/settings/SecondaryEmailConfirmModal.tsx L20-L31

Source: apps/web/components/settings/SecondaryEmailConfirmModal.tsx L20-L31

```typescript
        data-testid="secondary-email-confirm-dialog">
        <DialogFooter>
          <DialogClose color="primary" onClick={onCancel} data-testid="secondary-email-confirm-done-button">
            {t("done")}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SecondaryEmailConfirmModal;
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-36ec9f5830"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/components/settings/SecondaryEmailModal.tsx:62 — <DialogClose> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-36ec9f5830"></a>
### Autofix

apps/web/components/settings/SecondaryEmailModal.tsx L60-L73

Source: apps/web/components/settings/SecondaryEmailModal.tsx L60-L73

```typescript
          {errorMessage && <InputError message={errorMessage} />}
          <DialogFooter showDivider className="mt-10">
            <DialogClose onClick={onCancel}>{t("cancel")}</DialogClose>
            <Button type="submit" data-testid="add-secondary-email-button" disabled={isLoading}>
              {t("add_email")}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SecondaryEmailModal;
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-8a289ca780"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/components/ui/form/CheckedSelect.tsx:45 — <Icon> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-8a289ca780"></a>
### Autofix

apps/web/components/ui/form/CheckedSelect.tsx L43-L56

Source: apps/web/components/ui/form/CheckedSelect.tsx L43-L56

```typescript
          />
          {option.label}
          <Icon
            name="x"
            onClick={() => props.onChange(value.filter((item) => item.value !== option.value))}
            className="text-subtle float-right mt-0.5 h-5 w-5 cursor-pointer"
          />
        </div>
      ))}
    </>
  );
};

export default CheckedSelect;
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-c67d9069fb"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/components/ui/UsernameAvailability/PremiumTextfield.tsx:327 — <DialogClose> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-c67d9069fb"></a>
### Autofix

apps/web/components/ui/UsernameAvailability/PremiumTextfield.tsx L325-L337

Source: apps/web/components/ui/UsernameAvailability/PremiumTextfield.tsx L325-L337

```typescript
              </Button>
            )}
            <DialogClose color="secondary" onClick={() => setOpenDialogSaveUsername(false)}>
              {t("cancel")}
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { PremiumTextfield };
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-6b24d243e3"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/components/ui/UsernameAvailability/UsernameTextfield.tsx:203 — <DialogClose> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-6b24d243e3"></a>
### Autofix

apps/web/components/ui/UsernameAvailability/UsernameTextfield.tsx L201-L213

Source: apps/web/components/ui/UsernameAvailability/UsernameTextfield.tsx L201-L213

```typescript
            </Button>

            <DialogClose color="secondary" onClick={() => setOpenDialogSaveUsername(false)}>
              {t("cancel")}
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { UsernameTextfield };
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-31ad0f6949"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/api-keys/api-keys/components/ApiKeyListItem.tsx:83 — <DropdownItem> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-31ad0f6949"></a>
### Autofix

apps/web/modules/api-keys/api-keys/components/ApiKeyListItem.tsx L81-L107

Source: apps/web/modules/api-keys/api-keys/components/ApiKeyListItem.tsx L81-L107

```typescript
          <DropdownMenuContent>
            <DropdownMenuItem>
              <DropdownItem type="button" onClick={onEditClick} StartIcon="pencil">
                {t("edit") as string}
              </DropdownItem>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DropdownItem
                type="button"
                color="destructive"
                disabled={deleteApiKey.isPending}
                onClick={() => setDeleteDialogOpen(true)}
                StartIcon="trash"
                className="rounded-t-none">
                {t("delete") as string}
              </DropdownItem>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </Dropdown>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <ConfirmationDialogContent
          variety="danger"
          title={t("delete_api_key_confirm_title")}
          confirmBtnText={t("confirm_delete_api_key")}
          loadingText={t("confirm_delete_api_key")}
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-4737ae4f75"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/api-keys/api-keys/components/ApiKeyListItem.tsx:88 — <DropdownItem> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-4737ae4f75"></a>
### Autofix

apps/web/modules/api-keys/api-keys/components/ApiKeyListItem.tsx L86-L112

Source: apps/web/modules/api-keys/api-keys/components/ApiKeyListItem.tsx L86-L112

```typescript
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DropdownItem
                type="button"
                color="destructive"
                disabled={deleteApiKey.isPending}
                onClick={() => setDeleteDialogOpen(true)}
                StartIcon="trash"
                className="rounded-t-none">
                {t("delete") as string}
              </DropdownItem>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </Dropdown>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <ConfirmationDialogContent
          variety="danger"
          title={t("delete_api_key_confirm_title")}
          confirmBtnText={t("confirm_delete_api_key")}
          loadingText={t("confirm_delete_api_key")}
          isPending={deleteApiKey.isPending}
          onConfirm={() => {
            deleteApiKey.mutate({
              id: apiKey.id,
            });
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-ee9d075099"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/apps/components/AdminAppsList.tsx:259 — <DialogClose> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-ee9d075099"></a>
### Autofix

apps/web/modules/apps/components/AdminAppsList.tsx L257-L283

Source: apps/web/modules/apps/components/AdminAppsList.tsx L257-L283

```typescript
        )}
        <DialogFooter showDivider className="mt-8">
          <DialogClose onClick={handleModelClose} />
          <Button form="edit-keys" type="submit">
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EditModalState extends Pick<App, "keys"> {
  isOpen: "none" | "editKeys" | "disableKeys";
  dirName: string;
  type: string;
  slug: string;
  fromEnabled?: boolean;
  appName?: string;
}

const AdminAppsListContainer = () => {
  const searchParams = useCompatSearchParams();
  const { t } = useLocale();
  const category = searchParams?.get("category") || AppCategories.calendar;

  const { data: apps, isPending } = trpc.viewer.apps.listLocal.useQuery(
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-8c10e01ea8"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/apps/components/AllApps.tsx:102 — <li> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-8c10e01ea8"></a>
### Autofix

apps/web/modules/apps/components/AllApps.tsx L100-L126

Source: apps/web/modules/apps/components/AllApps.tsx L100-L126

```typescript
        onScroll={(e) => calculateScroll(e)}
        ref={ref}>
        <li
          onClick={() => {
            onCategoryChange(null);
          }}
          className={classNames(
            selectedCategory === null ? "bg-emphasis text-default" : "bg-cal-muted text-emphasis",
            "hover:bg-emphasis min-w-max rounded-md px-4 py-2.5 text-sm font-medium transition hover:cursor-pointer"
          )}>
          {t("all")}
        </li>
        {categories.map((cat, pos) => (
          <li
            key={pos}
            onClick={() => {
              if (selectedCategory === cat) {
                onCategoryChange(null);
              } else {
                onCategoryChange(cat);
              }
            }}
            className={classNames(
              selectedCategory === cat ? "bg-emphasis text-default" : "bg-cal-muted text-emphasis",
              "hover:bg-emphasis rounded-md px-4 py-2.5 text-sm font-medium transition hover:cursor-pointer"
            )}>
            {cat === "crm" ? cat.toUpperCase() : cat[0].toUpperCase() + cat.slice(1)}
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-a40e8c206a"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/blocklist/components/BlockedEntriesColumns.tsx:143 — <DropdownItem> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-a40e8c206a"></a>
### Autofix

apps/web/modules/blocklist/components/BlockedEntriesColumns.tsx L141-L167

Source: apps/web/modules/blocklist/components/BlockedEntriesColumns.tsx L141-L167

```typescript
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <DropdownItem type="button" StartIcon="eye" onClick={() => onViewDetails(entry)}>
                    {t("view_details")}
                  </DropdownItem>
                </DropdownMenuItem>
                {showDeleteOption && (
                  <DropdownMenuItem>
                    <DropdownItem
                      type="button"
                      color="destructive"
                      StartIcon="trash"
                      onClick={() => onDelete(entry)}>
                      {t("remove_from_blocklist")}
                    </DropdownItem>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </Dropdown>
          </div>
        );
      },
    });

    return columns;
  }, [t, scope, isSystem, canDelete, enableRowSelection, onViewDetails, onDelete]);
}
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-9714b8696b"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/blocklist/components/PendingReportsColumns.tsx:147 — <DropdownItem> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-9714b8696b"></a>
### Autofix

apps/web/modules/blocklist/components/PendingReportsColumns.tsx L145-L160

Source: apps/web/modules/blocklist/components/PendingReportsColumns.tsx L145-L160

```typescript
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <DropdownItem type="button" StartIcon="eye" onClick={() => onViewDetails(entry)}>
                    {t("view_details")}
                  </DropdownItem>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </Dropdown>
          </div>
        );
      },
    });

    return columns;
  }, [t, scope, isSystem, enableRowSelection, onViewDetails]);
}
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-829817b892"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/bookings/components/Booker.tsx:595 — <SlotSelectionModalHeader> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-829817b892"></a>
### Autofix

apps/web/modules/bookings/components/Booker.tsx L593-L619

Source: apps/web/modules/bookings/components/Booker.tsx L593-L619

```typescript
          enableOverflow
          className="fixed! inset-0! top-0! left-0! h-screen! max-h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! rounded-none! m-0! px-8 pt-0 pb-8">
          <SlotSelectionModalHeader
            onClick={() => setIsSlotSelectionModalVisible(false)}
            event={event.data}
            isPlatform={isPlatform}
            timeZones={timeZones}
            selectedDate={selectedDate}
          />
          <AvailableTimeSlots
            onAvailableTimeSlotSelect={onAvailableTimeSlotSelect}
            customClassNames={customClassNames?.availableTimeSlotsCustomClassNames}
            extraDays={extraDays}
            limitHeight={layout === BookerLayouts.MONTH_VIEW}
            schedule={schedule}
            isLoading={schedule.isPending}
            seatsPerTimeSlot={event.data?.seatsPerTimeSlot}
            unavailableTimeSlots={unavailableTimeSlots}
            showAvailableSeatsCount={event.data?.seatsShowAvailabilityCount}
            event={event}
            loadingStates={loadingStates}
            renderConfirmNotVerifyEmailButtonCond={renderConfirmNotVerifyEmailButtonCond}
            isVerificationCodeSending={isVerificationCodeSending}
            onSubmit={onSubmit}
            skipConfirmStep={skipConfirmStep}
            shouldRenderCaptcha={shouldRenderCaptcha}
            watchedCfToken={watchedCfToken}
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-e30be7bda2"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/bookings/components/VerifyCodeDialog.tsx:123 — <DialogClose> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-e30be7bda2"></a>
### Autofix

apps/web/modules/bookings/components/VerifyCodeDialog.tsx L121-L133

Source: apps/web/modules/bookings/components/VerifyCodeDialog.tsx L121-L133

```typescript
            )}
            <DialogFooter noSticky>
              <DialogClose onClick={() => setIsOpenDialog(false)} />
              <Button type="submit" onClick={verifyCode} loading={isPending}>
                {t("submit")}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-6a8e4d9d1a"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/calendars/weeklyview/components/event/Event.tsx:111 — <Component> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-6a8e4d9d1a"></a>
### Autofix

apps/web/modules/calendars/weeklyview/components/event/Event.tsx L109-L135

Source: apps/web/modules/calendars/weeklyview/components/event/Event.tsx L109-L135

```typescript
  return (
    <Tooltip content={tooltipContent} className="max-w-none" side={tooltipSide}>
      <Component
        data-booking-calendar-event="true"
        onClick={() => onEventClick?.(event)}
        {...(options?.bookingUid ? { "data-booking-uid": options.bookingUid } : {})}
        className={classNames(
          eventClasses({
            status: options?.status,
            disabled,
            selected,
            borderOnly: options?.borderOnly ?? false,
          }),
          options?.className,
          (isHovered || selected) && "ring-brand-default shadow-lg ring-2 ring-offset-0"
        )}
        style={{
          transition: "all 100ms ease-out",
        }}>
        {(options?.color || colorClass) && (
          <div
            className={classNames("-ml-1.5 mr-1.5 h-full w-[3px] shrink-0", colorClass)}
            style={options?.color ? { backgroundColor: options.color } : undefined}></div>
        )}
        <div className={classNames("flex w-full", displayType !== "single-line" && "flex-col py-1")}>
          {displayType === "single-line" && (
            <div
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-7fdb8c3c02"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/embed/components/Embed.tsx:1475 — <Component> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-7fdb8c3c02"></a>
### Autofix

apps/web/modules/embed/components/Embed.tsx L1473-L1485

Source: apps/web/modules/embed/components/Embed.tsx L1473-L1485

```typescript

  return (
    <Component
      {...props}
      className={className}
      data-test-embed-url={embedUrl}
      data-testid="embed"
      type="button"
      onClick={openEmbedModal}>
      {children}
    </Component>
  );
};
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-93d03e42e2"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/settings/components/TimezoneChangeDialog.tsx:68 — <DialogClose> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-93d03e42e2"></a>
### Autofix

apps/web/modules/settings/components/TimezoneChangeDialog.tsx L66-L92

Source: apps/web/modules/settings/components/TimezoneChangeDialog.tsx L66-L92

```typescript
      <div className="mb-8" />
      <DialogFooter showDivider>
        <DialogClose onClick={() => hideDialogFor([3, "months"], t("we_wont_show_again"))} color="secondary">
          {t("dont_update")}
        </DialogClose>
        <DialogClose onClick={() => updateTimezone()} color="primary">
          {t("update_timezone")}
        </DialogClose>
      </DialogFooter>
    </>
  );
};

export function useOpenTimezoneDialog() {
  const { data: user } = trpc.viewer.me.get.useQuery();
  const [showDialog, setShowDialog] = useState(false);
  const { data: userSession, status } = useSession();

  useEffect(() => {
    if (!user?.timeZone || status !== "authenticated" || userSession?.user?.impersonatedBy) {
      return;
    }

    if (
      dayjs.tz(undefined, CURRENT_TIMEZONE).utcOffset() !== dayjs.tz(undefined, user.timeZone).utcOffset()
    ) {
      setShowDialog(true);
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-ef4a7906a9"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/settings/components/TimezoneChangeDialog.tsx:71 — <DialogClose> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-ef4a7906a9"></a>
### Autofix

apps/web/modules/settings/components/TimezoneChangeDialog.tsx L69-L95

Source: apps/web/modules/settings/components/TimezoneChangeDialog.tsx L69-L95

```typescript
          {t("dont_update")}
        </DialogClose>
        <DialogClose onClick={() => updateTimezone()} color="primary">
          {t("update_timezone")}
        </DialogClose>
      </DialogFooter>
    </>
  );
};

export function useOpenTimezoneDialog() {
  const { data: user } = trpc.viewer.me.get.useQuery();
  const [showDialog, setShowDialog] = useState(false);
  const { data: userSession, status } = useSession();

  useEffect(() => {
    if (!user?.timeZone || status !== "authenticated" || userSession?.user?.impersonatedBy) {
      return;
    }

    if (
      dayjs.tz(undefined, CURRENT_TIMEZONE).utcOffset() !== dayjs.tz(undefined, user.timeZone).utcOffset()
    ) {
      setShowDialog(true);
    }
  }, [user?.timeZone, status, userSession?.user?.impersonatedBy]);

```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-03751d972b"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/settings/developer/oauth-clients-view.tsx:108 — <NewOAuthClientButton> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-03751d972b"></a>
### Autofix

apps/web/modules/settings/developer/oauth-clients-view.tsx L106-L132

Source: apps/web/modules/settings/developer/oauth-clients-view.tsx L106-L132

```typescript

  const newOAuthClientButton = (
    <NewOAuthClientButton
      dataTestId="open-oauth-client-create-dialog"
      onClick={() => setIsCreatingClient(true)}
    />
  );

  return (
    <SettingsHeader
      title={t("oauth_clients")}
      description={t("oauth_clients_description")}
      CTA={newOAuthClientButton}
      borderInShellHeader={true}>
      <div>
        {oAuthClients && oAuthClients.length > 0 ? (
          <div className="border-subtle rounded-b-lg border border-t-0">
            <OAuthClientsList
              clients={oAuthClients.map((client) => ({
                clientId: client.clientId,
                name: client.name,
                purpose: client.purpose,
                redirectUri: client.redirectUri,
                websiteUrl: client.websiteUrl,
                logo: client.logo,
                status: client.status,
                rejectionReason: client.rejectionReason,
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-adb7e3dd02"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/users/components/UserTable/PlatformManagedUsersTable.tsx:163 — <Badge> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-adb7e3dd02"></a>
### Autofix

apps/web/modules/users/components/UserTable/PlatformManagedUsersTable.tsx L161-L187

Source: apps/web/modules/users/components/UserTable/PlatformManagedUsersTable.tsx L161-L187

```typescript
          const { role, username } = row.original;
          return (
            <Badge
              data-testid={`member-${username}-role`}
              variant={role === "MEMBER" ? "gray" : "blue"}
              onClick={() => {
                table.getColumn("role")?.setFilterValue([role]);
              }}>
              {role}
            </Badge>
          );
        },
      },
      {
        id: "teams",
        accessorFn: (data) =>
          data.teams.map((team: { id: number; name: string; slug: string | null }) => team.name),
        header: t("teams"),
        size: 140,
        cell: ({ row, table }) => {
          if (isPending) {
            return <SkeletonText className="h-6 w-1/4" />;
          }
          const { teams, accepted, email, username } = row.original;
          // TODO: Implement click to filter
          return (
            <div className="flex h-full flex-wrap items-center gap-2">
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-1789894afb"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/users/components/UserTable/UserListTable.tsx:368 — <Badge> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-1789894afb"></a>
### Autofix

apps/web/modules/users/components/UserTable/UserListTable.tsx L366-L392

Source: apps/web/modules/users/components/UserTable/UserListTable.tsx L366-L392

```typescript
          }
          return (
            <Badge
              data-testid={`member-${username}-role`}
              variant={roleVariant}
              onClick={() => {
                table.getColumn("role")?.setFilterValue([role]);
              }}>
              {roleName}
            </Badge>
          );
        },
      },
      {
        id: "teams",
        accessorFn: (data: UserTableUser) =>
          data.teams.map(
            (team: {
              id: number;
              name: string;
              slug: string | null;
              logoUrl?: string | null;
              isOrganization?: boolean;
            }) => team.name
          ),
        header: t("teams"),
        size: 140,
```

<a id="finding-repository-health-accessibility-wcag-4-1-2-name-role-value-5328c2061a"></a>
## Accessibility issue: wcag-4.1.2-name-role-value

Severity: Error
Classification: Accessibility
Language: TypeScript
Framework: Accessibility

apps/web/modules/users/components/UserTable/UserListTable.tsx:754 — <DataTableToolbar.CTA> is interactive (has event handlers) but has no ARIA role. Assistive technology cannot determine its purpose.

**Criterion:** wcag-2.1 SC 4.1.2 Name, Role, Value

**Recommended next step:** Add an appropriate role attribute (e.g., role="button", role="link", role="tab").

<a id="source-repository-health-accessibility-wcag-4-1-2-name-role-value-5328c2061a"></a>
### Autofix

apps/web/modules/users/components/UserTable/UserListTable.tsx L752-L778

Source: apps/web/modules/users/components/UserTable/UserListTable.tsx L752-L778

```typescript
        createPortal(
          <div className="flex items-center gap-2">
            <DataTableToolbar.CTA
              type="button"
              color="secondary"
              StartIcon="file-down"
              loading={isDownloading}
              onClick={() => handleDownload()}
              data-testid="export-members-button">
              {t("download")}
            </DataTableToolbar.CTA>
            {(permissions?.canInvite ?? adminOrOwner) && (
              <DataTableToolbar.CTA
                type="button"
                color="primary"
                StartIcon="plus"
                onClick={() => {
                  dispatch({
                    type: "INVITE_MEMBER",
                    payload: {
                      showModal: true,
                    },
                  });
                  posthog.capture("add_organization_member_clicked");
                }}
                data-testid="new-organization-member-button">
                {t("add")}
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-cfe70c8504"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:50 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-cfe70c8504"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L48-L74

Source: apps/web/public/country-flag-icons/3x2/index.html L48-L74

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Ascension%20Island%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Ascension Island" class="CountryFlag" src="./AC.svg"/>
					</a>
				</div>
				<h1 title="Ascension Island">
					AC
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Andorra%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Andorra" class="CountryFlag" src="./AD.svg"/>
					</a>
				</div>
				<h1 title="Andorra">
					AD
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=United%20Arab%20Emirates%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="United Arab Emirates" class="CountryFlag" src="./AE.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-92ec5fc8df"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:61 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-92ec5fc8df"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L59-L85

Source: apps/web/public/country-flag-icons/3x2/index.html L59-L85

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Andorra%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Andorra" class="CountryFlag" src="./AD.svg"/>
					</a>
				</div>
				<h1 title="Andorra">
					AD
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=United%20Arab%20Emirates%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="United Arab Emirates" class="CountryFlag" src="./AE.svg"/>
					</a>
				</div>
				<h1 title="United Arab Emirates">
					AE
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Afghanistan%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Afghanistan" class="CountryFlag" src="./AF.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-1a11905ba5"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:72 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-1a11905ba5"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L70-L96

Source: apps/web/public/country-flag-icons/3x2/index.html L70-L96

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=United%20Arab%20Emirates%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="United Arab Emirates" class="CountryFlag" src="./AE.svg"/>
					</a>
				</div>
				<h1 title="United Arab Emirates">
					AE
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Afghanistan%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Afghanistan" class="CountryFlag" src="./AF.svg"/>
					</a>
				</div>
				<h1 title="Afghanistan">
					AF
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Antigua%20and%20Barbuda%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Antigua and Barbuda" class="CountryFlag" src="./AG.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-f5efbb887d"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:83 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-f5efbb887d"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L81-L107

Source: apps/web/public/country-flag-icons/3x2/index.html L81-L107

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Afghanistan%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Afghanistan" class="CountryFlag" src="./AF.svg"/>
					</a>
				</div>
				<h1 title="Afghanistan">
					AF
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Antigua%20and%20Barbuda%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Antigua and Barbuda" class="CountryFlag" src="./AG.svg"/>
					</a>
				</div>
				<h1 title="Antigua and Barbuda">
					AG
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Anguilla%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Anguilla" class="CountryFlag" src="./AI.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-4981e87165"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:94 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-4981e87165"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L92-L118

Source: apps/web/public/country-flag-icons/3x2/index.html L92-L118

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Antigua%20and%20Barbuda%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Antigua and Barbuda" class="CountryFlag" src="./AG.svg"/>
					</a>
				</div>
				<h1 title="Antigua and Barbuda">
					AG
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Anguilla%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Anguilla" class="CountryFlag" src="./AI.svg"/>
					</a>
				</div>
				<h1 title="Anguilla">
					AI
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Albania%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Albania" class="CountryFlag" src="./AL.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-2f405151a5"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:105 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-2f405151a5"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L103-L129

Source: apps/web/public/country-flag-icons/3x2/index.html L103-L129

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Anguilla%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Anguilla" class="CountryFlag" src="./AI.svg"/>
					</a>
				</div>
				<h1 title="Anguilla">
					AI
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Albania%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Albania" class="CountryFlag" src="./AL.svg"/>
					</a>
				</div>
				<h1 title="Albania">
					AL
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Armenia%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Armenia" class="CountryFlag" src="./AM.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-87c7a161e0"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:116 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-87c7a161e0"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L114-L140

Source: apps/web/public/country-flag-icons/3x2/index.html L114-L140

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Albania%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Albania" class="CountryFlag" src="./AL.svg"/>
					</a>
				</div>
				<h1 title="Albania">
					AL
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Armenia%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Armenia" class="CountryFlag" src="./AM.svg"/>
					</a>
				</div>
				<h1 title="Armenia">
					AM
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Angola%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Angola" class="CountryFlag" src="./AO.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-cd16051bfc"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:127 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-cd16051bfc"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L125-L151

Source: apps/web/public/country-flag-icons/3x2/index.html L125-L151

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Armenia%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Armenia" class="CountryFlag" src="./AM.svg"/>
					</a>
				</div>
				<h1 title="Armenia">
					AM
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Angola%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Angola" class="CountryFlag" src="./AO.svg"/>
					</a>
				</div>
				<h1 title="Angola">
					AO
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Antarctica%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Antarctica" class="CountryFlag" src="./AQ.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-5347e5d6f1"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:138 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-5347e5d6f1"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L136-L162

Source: apps/web/public/country-flag-icons/3x2/index.html L136-L162

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Angola%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Angola" class="CountryFlag" src="./AO.svg"/>
					</a>
				</div>
				<h1 title="Angola">
					AO
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Antarctica%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Antarctica" class="CountryFlag" src="./AQ.svg"/>
					</a>
				</div>
				<h1 title="Antarctica">
					AQ
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Argentina%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Argentina" class="CountryFlag" src="./AR.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-a49a091245"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:149 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-a49a091245"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L147-L173

Source: apps/web/public/country-flag-icons/3x2/index.html L147-L173

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Antarctica%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Antarctica" class="CountryFlag" src="./AQ.svg"/>
					</a>
				</div>
				<h1 title="Antarctica">
					AQ
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Argentina%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Argentina" class="CountryFlag" src="./AR.svg"/>
					</a>
				</div>
				<h1 title="Argentina">
					AR
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=American%20Samoa%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="American Samoa" class="CountryFlag" src="./AS.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-81f59d3986"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:160 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-81f59d3986"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L158-L184

Source: apps/web/public/country-flag-icons/3x2/index.html L158-L184

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Argentina%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Argentina" class="CountryFlag" src="./AR.svg"/>
					</a>
				</div>
				<h1 title="Argentina">
					AR
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=American%20Samoa%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="American Samoa" class="CountryFlag" src="./AS.svg"/>
					</a>
				</div>
				<h1 title="American Samoa">
					AS
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Austria%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Austria" class="CountryFlag" src="./AT.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-579d4ca84c"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:171 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-579d4ca84c"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L169-L195

Source: apps/web/public/country-flag-icons/3x2/index.html L169-L195

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=American%20Samoa%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="American Samoa" class="CountryFlag" src="./AS.svg"/>
					</a>
				</div>
				<h1 title="American Samoa">
					AS
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Austria%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Austria" class="CountryFlag" src="./AT.svg"/>
					</a>
				</div>
				<h1 title="Austria">
					AT
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Australia%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Australia" class="CountryFlag" src="./AU.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-4adced2a8a"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:182 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-4adced2a8a"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L180-L206

Source: apps/web/public/country-flag-icons/3x2/index.html L180-L206

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Austria%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Austria" class="CountryFlag" src="./AT.svg"/>
					</a>
				</div>
				<h1 title="Austria">
					AT
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Australia%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Australia" class="CountryFlag" src="./AU.svg"/>
					</a>
				</div>
				<h1 title="Australia">
					AU
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Aruba%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Aruba" class="CountryFlag" src="./AW.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-0b56d1bcb2"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:193 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-0b56d1bcb2"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L191-L217

Source: apps/web/public/country-flag-icons/3x2/index.html L191-L217

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Australia%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Australia" class="CountryFlag" src="./AU.svg"/>
					</a>
				</div>
				<h1 title="Australia">
					AU
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Aruba%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Aruba" class="CountryFlag" src="./AW.svg"/>
					</a>
				</div>
				<h1 title="Aruba">
					AW
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=%C3%85land%20Islands%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Åland Islands" class="CountryFlag" src="./AX.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-72637e1891"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:204 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-72637e1891"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L202-L228

Source: apps/web/public/country-flag-icons/3x2/index.html L202-L228

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Aruba%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Aruba" class="CountryFlag" src="./AW.svg"/>
					</a>
				</div>
				<h1 title="Aruba">
					AW
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=%C3%85land%20Islands%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Åland Islands" class="CountryFlag" src="./AX.svg"/>
					</a>
				</div>
				<h1 title="Åland Islands">
					AX
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Azerbaijan%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Azerbaijan" class="CountryFlag" src="./AZ.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-8c1d836571"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:215 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-8c1d836571"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L213-L239

Source: apps/web/public/country-flag-icons/3x2/index.html L213-L239

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=%C3%85land%20Islands%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Åland Islands" class="CountryFlag" src="./AX.svg"/>
					</a>
				</div>
				<h1 title="Åland Islands">
					AX
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Azerbaijan%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Azerbaijan" class="CountryFlag" src="./AZ.svg"/>
					</a>
				</div>
				<h1 title="Azerbaijan">
					AZ
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Bosnia%20and%20Herzegovina%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Bosnia and Herzegovina" class="CountryFlag" src="./BA.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-8f566ba335"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:226 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-8f566ba335"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L224-L250

Source: apps/web/public/country-flag-icons/3x2/index.html L224-L250

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Azerbaijan%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Azerbaijan" class="CountryFlag" src="./AZ.svg"/>
					</a>
				</div>
				<h1 title="Azerbaijan">
					AZ
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Bosnia%20and%20Herzegovina%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Bosnia and Herzegovina" class="CountryFlag" src="./BA.svg"/>
					</a>
				</div>
				<h1 title="Bosnia and Herzegovina">
					BA
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Barbados%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Barbados" class="CountryFlag" src="./BB.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-481a283818"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:237 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-481a283818"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L235-L261

Source: apps/web/public/country-flag-icons/3x2/index.html L235-L261

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Bosnia%20and%20Herzegovina%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Bosnia and Herzegovina" class="CountryFlag" src="./BA.svg"/>
					</a>
				</div>
				<h1 title="Bosnia and Herzegovina">
					BA
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Barbados%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Barbados" class="CountryFlag" src="./BB.svg"/>
					</a>
				</div>
				<h1 title="Barbados">
					BB
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Bangladesh%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Bangladesh" class="CountryFlag" src="./BD.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-8a87cdaeb5"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:248 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-8a87cdaeb5"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L246-L272

Source: apps/web/public/country-flag-icons/3x2/index.html L246-L272

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Barbados%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Barbados" class="CountryFlag" src="./BB.svg"/>
					</a>
				</div>
				<h1 title="Barbados">
					BB
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Bangladesh%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Bangladesh" class="CountryFlag" src="./BD.svg"/>
					</a>
				</div>
				<h1 title="Bangladesh">
					BD
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Belgium%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Belgium" class="CountryFlag" src="./BE.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-accessibility-wcag-1-1-1-img-alt-d70ff79fae"></a>
## Accessibility issue: wcag-1.1.1-img-alt

Severity: Error
Classification: Accessibility
Language: HTML
Framework: Accessibility

apps/web/public/country-flag-icons/3x2/index.html:259 — <img> element is missing the alt attribute.

**Criterion:** wcag-2.1 SC 1.1.1 Non-text Content

**Recommended next step:** Add alt="description" for informative images, or alt="" for decorative images.

<a id="source-repository-health-accessibility-wcag-1-1-1-img-alt-d70ff79fae"></a>
### Autofix

apps/web/public/country-flag-icons/3x2/index.html L257-L283

Source: apps/web/public/country-flag-icons/3x2/index.html L257-L283

```html
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Bangladesh%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Bangladesh" class="CountryFlag" src="./BD.svg"/>
					</a>
				</div>
				<h1 title="Bangladesh">
					BD
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Belgium%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Belgium" class="CountryFlag" src="./BE.svg"/>
					</a>
				</div>
				<h1 title="Belgium">
					BE
				</h1>
			</section>

			<section class="Country">
				<div class="CountryFlagContainer">
					<a href="https://www.google.com/search?q=Burkina%20Faso%20flag&tbm=isch" target="_blank" class="CountryFlagLink">
						<img title="Burkina Faso" class="CountryFlag" src="./BF.svg"/>
					</a>
				</div>
```

<a id="finding-repository-health-analysis-incomplete"></a>
## Repository health analysis had incomplete probe coverage

Severity: Error
Classification: Analysis completeness
Language: prisma
Framework: Analysis completeness

12 probe(s) failed and 0 detector warning(s) were recorded.

**Criterion:** Repository health scans require all selected probes and resource detectors to complete cleanly.

**Recommended next step:** Fix failed probes before publishing customer-facing results; warnings should identify the detector and exception message.

<a id="source-repository-health-analysis-incomplete"></a>
### Source evidence

packages/platform/examples/base/prisma/schema.prisma L15-L26

Source: packages/platform/examples/base/prisma/schema.prisma L15-L26

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  calcomUserId Int? @unique
  calcomUsername String? @unique
  refreshToken String? @unique
  accessToken String? @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now())

}
```

<a id="finding-repository-health-complexity-textfilter-b18a3184a6"></a>
## High complexity in textFilter

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/data-table/lib/utils.ts:18 has cyclomatic complexity 18, cognitive complexity 10, and maintainability 45.56.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-textfilter-b18a3184a6"></a>
### Autofix

packages/features/data-table/lib/utils.ts L16-L47

Source: packages/features/data-table/lib/utils.ts L16-L47

```typescript
} from "./types";

export const textFilter = (cellValue: unknown, filterValue: TextFilterValue) => {
  if (filterValue.data.operator === "isEmpty" && !cellValue) {
    return true;
  }

  if (typeof cellValue !== "string") {
    return false;
  }

  switch (filterValue.data.operator) {
    case "equals":
      return cellValue.toLowerCase() === (filterValue.data.operand || "").toLowerCase();
    case "notEquals":
      return cellValue.toLowerCase() !== (filterValue.data.operand || "").toLowerCase();
    case "contains":
      return cellValue.toLowerCase().includes((filterValue.data.operand || "").toLowerCase());
    case "notContains":
      return !cellValue.toLowerCase().includes((filterValue.data.operand || "").toLowerCase());
    case "startsWith":
      return cellValue.toLowerCase().startsWith((filterValue.data.operand || "").toLowerCase());
    case "endsWith":
      return cellValue.toLowerCase().endsWith((filterValue.data.operand || "").toLowerCase());
    case "isEmpty":
      return cellValue.trim() === "";
    case "isNotEmpty":
      return cellValue.trim() !== "";
    default:
      return false;
  }
};
```

<a id="finding-repository-health-complexity-deletesubscription-d2b3e5f646"></a>
## High complexity in deleteSubscription

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/webhooks/lib/scheduleTrigger.ts:132 has cyclomatic complexity 17, cognitive complexity 26, and maintainability 40.87.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-deletesubscription-d2b3e5f646"></a>
### Autofix

packages/features/webhooks/lib/scheduleTrigger.ts L130-L180

Source: packages/features/webhooks/lib/scheduleTrigger.ts L130-L180

```typescript
}

export async function deleteSubscription({
  appApiKey,
  webhookId,
  appId,
  account,
}: {
  appApiKey?: ApiKey;
  webhookId: string;
  appId: string;
  account?: {
    id: number;
    name: string | null;
    isTeam: boolean;
  } | null;
}) {
  const userId = appApiKey ? appApiKey.userId : account && !account.isTeam ? account.id : null;
  const teamId = appApiKey ? appApiKey.teamId : account && account.isTeam ? account.id : null;
  try {
    let where: Prisma.WebhookWhereInput = {};
    if (teamId) {
      where = { teamId };
    } else {
      where = { userId };
    }

    const deleteWebhook = await prisma.webhook.delete({
      where: {
        ...where,
        appId: appId,
        id: webhookId,
      },
    });

    if (!deleteWebhook) {
      throw new Error(`Unable to delete webhook ${webhookId}`);
    }
    return deleteWebhook;
  } catch (err) {
    const userId = appApiKey ? appApiKey.userId : account && !account.isTeam ? account.id : null;
    const teamId = appApiKey ? appApiKey.teamId : account && account.isTeam ? account.id : null;

    log.error(
      `Error deleting subscription for user ${
        teamId ? `team ${teamId}` : `userId ${userId}`
      }, webhookId ${webhookId}`,
      safeStringify(err)
    );
  }
}
```

<a id="finding-repository-health-complexity-processevents-a2173ba1fe"></a>
## High complexity in processEvents

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/calendar-subscription/lib/CalendarSubscriptionService.ts:228 has cyclomatic complexity 16, cognitive complexity 15, and maintainability 27.91.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-processevents-a2173ba1fe"></a>
### Autofix

packages/features/calendar-subscription/lib/CalendarSubscriptionService.ts L226-L354

Source: packages/features/calendar-subscription/lib/CalendarSubscriptionService.ts L226-L354

```typescript
   */
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: event processing requires multiple steps
  async processEvents(selectedCalendar: SelectedCalendar): Promise<{
    eventsFetched: number;
    eventsCached: number;
    eventsSynced: number;
    propagationLagMs?: { avg: number; max: number; min: number; count: number };
  }> {
    const startTime = performance.now();

    const result: {
      eventsFetched: number;
      eventsCached: number;
      eventsSynced: number;
      propagationLagMs?: { avg: number; max: number; min: number; count: number };
    } = {
      eventsFetched: 0,
      eventsCached: 0,
      eventsSynced: 0,
    };

    const calendarSubscriptionAdapter = this.deps.adapterFactory.get(
      selectedCalendar.integration as CalendarSubscriptionProvider
    );

    if (!selectedCalendar.credentialId && !selectedCalendar.delegationCredentialId) {
      log.debug("Selected Calendar doesn't have credentials", {
        selectedCalendarId: selectedCalendar.id,
      });
      return result;
    }

    const [cacheEnabled, syncEnabled, cacheEnabledForUser] = await Promise.all([
      this.isCacheEnabled(),
      this.isSyncEnabled(),
      this.isCacheEnabledForUser(selectedCalendar.userId),
    ]);

    if (!cacheEnabled && !syncEnabled) {
      log.info("Cache and sync are globally disabled", {
        channelId: selectedCalendar.channelId,
      });
      return result;
    }

    log.debug("Processing events", { channelId: selectedCalendar.channelId });

    const credential = await this.getCredential(selectedCalendar);
    if (!credential) {
      return result;
    }

    let events: CalendarSubscriptionEvent | null = null;
    try {
      events = await calendarSubscriptionAdapter.fetchEvents(selectedCalendar, credential);
    } catch (err) {
      metrics.count("calendar.subscription.events.fetch.error", 1, {
        attributes: { provider: selectedCalendar.integration },
      });
      await this.deps.selectedCalendarRepository.updateSyncStatus(selectedCalendar.id, {
        syncErrorAt: new Date(),
        syncErrorCount: { increment: 1 },
      });
      throw err;
    }

    if (!events?.items?.length) {
      log.debug("No events fetched", { channelId: selectedCalendar.channelId });
      return result;
    }

    result.eventsFetched = events.items.length;

    metrics.distribution("calendar.subscription.events.fetched", events.items.length, {
      attributes: {
        provider: selectedCalendar.integration,
        incremental: !!selectedCalendar.syncToken,
      },
    });

    const now = Date.now();
    const lagStats = this.calculatePropagationLag(events.items, now);
    if (lagStats) {
      result.propagationLagMs = lagStats;
      metrics.distribution("calendar.subscription.propagation_lag.avg_ms", lagStats.avg, {
        attributes: { provider: selectedCalendar.integration },
      });
      metrics.distribution("calendar.subscription.propagation_lag.max_ms", lagStats.max, {
        attributes: { provider: selectedCalendar.integration },
      });
    }

    await this.deps.selectedCalendarRepository.updateSyncStatus(selectedCalendar.id, {
      syncToken: events.syncToken || selectedCalendar.syncToken,
      syncedAt: new Date(),
      syncErrorAt: null,
      syncErrorCount: 0,
    });

    if (cacheEnabled && cacheEnabledForUser) {
      log.debug("Caching events", { count: events.items.length });
      await this.deps.calendarCacheEventService.handleEvents(selectedCalendar, events.items);
      result.eventsCached = events.items.length;

      metrics.distribution("calendar.subscription.events.cached", events.items.length, {
        attributes: { provider: selectedCalendar.integration },
      });
    }

    if (syncEnabled) {
      log.debug("Syncing events", { count: events.items.length });
      await this.deps.calendarSyncService.handleEvents(selectedCalendar, events.items);
      result.eventsSynced = events.items.length;

      metrics.distribution("calendar.subscription.events.synced", events.items.length, {
        attributes: { provider: selectedCalendar.integration },
      });
    }

    metrics.distribution("calendar.subscription.processEvents.duration_ms", performance.now() - startTime, {
      attributes: {
        provider: selectedCalendar.integration,
        cache: cacheEnabled && cacheEnabledForUser ? "on" : "off",
        sync: syncEnabled ? "on" : "off",
      },
    });

    return result;
  }
```

<a id="finding-repository-health-complexity-detectcontenttype-83acfa1fbf"></a>
## High complexity in detectContentType

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

packages/lib/server/imageUtils.ts:46 has cyclomatic complexity 16, cognitive complexity 9, and maintainability 41.22.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-detectcontenttype-83acfa1fbf"></a>
### Autofix

packages/lib/server/imageUtils.ts L44-L92

Source: packages/lib/server/imageUtils.ts L44-L92

```typescript
 * irrelevant formats like PDF, ICO, TIFF, etc. that aren't used for logos.
 */
export async function detectContentType(buffer: Buffer): Promise<string | null> {
  if ([0xff, 0xd8, 0xff].every((b, i) => buffer[i] === b)) {
    return JPEG;
  }
  if ([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => buffer[i] === b)) {
    return PNG;
  }
  if ([0x47, 0x49, 0x46, 0x38].every((b, i) => buffer[i] === b)) {
    return GIF;
  }
  if ([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50].every((b, i) => !b || buffer[i] === b)) {
    return WEBP;
  }
  if ([0x3c, 0x3f, 0x78, 0x6d, 0x6c].every((b, i) => buffer[i] === b)) {
    return SVG;
  }
  if ([0x3c, 0x73, 0x76, 0x67].every((b, i) => buffer[i] === b)) {
    return SVG;
  }
  if ([0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66].every((b, i) => !b || buffer[i] === b)) {
    return AVIF;
  }

  // Fallback to sharp metadata detection
  try {
    const meta = await sharp(buffer).metadata();
    switch (meta?.format) {
      case "avif":
        return AVIF;
      case "webp":
        return WEBP;
      case "png":
        return PNG;
      case "jpeg":
      case "jpg":
        return JPEG;
      case "gif":
        return GIF;
      case "svg":
        return SVG;
      default:
        return null;
    }
  } catch {
    return null;
  }
}
```

<a id="finding-repository-health-complexity-reschedulebooking-c07f7f1811"></a>
## High complexity in rescheduleBooking

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts:743 has cyclomatic complexity 15, cognitive complexity 14, and maintainability 33.91.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-reschedulebooking-c07f7f1811"></a>
### Autofix

apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts L741-L822

Source: apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts L741-L822

```typescript
  }

  async rescheduleBooking(
    request: Request,
    bookingUid: string,
    body: RescheduleBookingInput,
    authUser: AuthOptionalUser
  ) {
    try {
      const isIndividualSeatRequest = this.isRescheduleSeatedBody(body);
      const isIndividualSeatReschedule = await this.shouldRescheduleIndividualSeat(
        bookingUid,
        isIndividualSeatRequest,
        authUser
      );

      const bookingRequest = await this.inputService.createRescheduleBookingRequest(
        request,
        bookingUid,
        body,
        isIndividualSeatReschedule
      );

      await this.canRescheduleBooking(bookingUid);

      const booking = await this.regularBookingService.createBooking({
        bookingData: bookingRequest.body,
        bookingMeta: {
          userId: bookingRequest.userId ?? authUser?.id,
          hostname: bookingRequest.headers?.host || "",
          platformClientId: bookingRequest.platformClientId,
          platformRescheduleUrl: bookingRequest.platformRescheduleUrl,
          platformCancelUrl: bookingRequest.platformCancelUrl,
          platformBookingUrl: bookingRequest.platformBookingUrl,
          platformBookingLocation: bookingRequest.platformBookingLocation,
          areCalendarEventsEnabled: bookingRequest.areCalendarEventsEnabled,
        },
      });
      if (!booking.uid) {
        throw new Error("Booking missing uid");
      }

      const databaseBooking =
        await this.bookingsRepository.getByUidWithAttendeesWithBookingSeatAndUserAndEvent(booking.uid);
      if (!databaseBooking) {
        throw new Error(`Booking with uid=${booking.uid} was not found in the database`);
      }

      const userIsEventTypeAdminOrOwner =
        authUser && databaseBooking.eventType
          ? await this.eventTypeAccessService.userIsEventTypeAdminOrOwner(authUser, databaseBooking.eventType)
          : false;
      const isRecurring = !!databaseBooking.recurringEventId;
      const isSeated = !!databaseBooking.eventType?.seatsPerTimeSlot;
      const isPlatformManagedUserBooking = !!(booking.userId && booking.user?.isPlatformManaged);

      if (isRecurring && !isSeated) {
        const outputBooking = await this.outputService.getOutputRecurringBooking(databaseBooking);
        return Object.assign(outputBooking, { isPlatformManagedUserBooking });
      }
      if (isRecurring && isSeated) {
        const outputBooking = await this.outputService.getOutputCreateRecurringSeatedBooking(
          databaseBooking,
          booking?.seatReferenceUid || "",
          userIsEventTypeAdminOrOwner
        );
        return Object.assign(outputBooking, { isPlatformManagedUserBooking });
      }
      if (isSeated) {
        const outputBooking = await this.outputService.getOutputCreateSeatedBooking(
          databaseBooking,
          booking.seatReferenceUid || "",
          userIsEventTypeAdminOrOwner
        );
        return Object.assign(outputBooking, { isPlatformManagedUserBooking });
      }
      const outputBooking = await this.outputService.getOutputBooking(databaseBooking);
      return Object.assign(outputBooking, { isPlatformManagedUserBooking });
    } catch (error) {
      this.errorsBookingsService.handleBookingError(error, false);
    }
  }
```

<a id="finding-repository-health-complexity-handleroundrobinrescheduled-22798f212e"></a>
## High complexity in _handleRoundRobinRescheduled

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/bookings/lib/BookingEmailSmsHandler.ts:135 has cyclomatic complexity 14, cognitive complexity 14, and maintainability 29.58.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-handleroundrobinrescheduled-22798f212e"></a>
### Autofix

packages/features/bookings/lib/BookingEmailSmsHandler.ts L133-L254

Source: packages/features/bookings/lib/BookingEmailSmsHandler.ts L133-L254

```typescript
   * Handles notifications for a RESCHEDULED RR booking.
   */
  private async _handleRoundRobinRescheduled(data: RescheduleEmailAndSmsPayload) {
    const {
      evt,
      eventType: { metadata },
      originalRescheduledBooking,
      rescheduleReason,
      additionalNotes,
      changedOrganizer,
      additionalInformation,
      users,
      isRescheduledByBooker,
      iCalUID,
    } = data;
    const copyEvent = cloneDeep(evt);
    const copyEventAdditionalInfo = {
      ...copyEvent,
      additionalInformation,
      additionalNotes,
      cancellationReason: `$RCH$${rescheduleReason || ""}`,
    };
    const cancelledRRHostEvt = cloneDeep(copyEventAdditionalInfo);
    this.log.debug("Emails: Sending rescheduled emails for booking confirmation");

    const originalBookingMemberEmails: Person[] = [];

    for (const user of originalRescheduledBooking.attendees) {
      const translate = await getTranslation(user.locale ?? "en", "common");
      originalBookingMemberEmails.push({
        name: user.name,
        email: user.email,
        timeZone: user.timeZone,
        phoneNumber: user.phoneNumber,
        language: { translate, locale: user.locale ?? "en" },
      });
    }
    if (originalRescheduledBooking.user) {
      const translate = await getTranslation(originalRescheduledBooking.user.locale ?? "en", "common");
      const originalOrganizer = originalRescheduledBooking.user;

      originalBookingMemberEmails.push({
        ...originalRescheduledBooking.user,
        username: originalRescheduledBooking.user.username ?? undefined,
        timeFormat: getTimeFormatStringFromUserTimeFormat(originalRescheduledBooking.user.timeFormat),
        name: originalRescheduledBooking.user.name || "",
        language: { translate, locale: originalRescheduledBooking.user.locale ?? "en" },
      });

      if (changedOrganizer) {
        cancelledRRHostEvt.title = originalRescheduledBooking.title;
        cancelledRRHostEvt.startTime =
          dayjs(originalRescheduledBooking?.startTime).utc().format() || copyEventAdditionalInfo.startTime;
        cancelledRRHostEvt.endTime =
          dayjs(originalRescheduledBooking?.endTime).utc().format() || copyEventAdditionalInfo.endTime;
        cancelledRRHostEvt.organizer = {
          email: originalOrganizer.email,
          name: originalOrganizer.name || "",
          timeZone: originalOrganizer.timeZone,
          language: { translate, locale: originalOrganizer.locale || "en" },
        };
      }
    }

    const newBookingMemberEmails: Person[] = [
      ...(copyEvent.team?.members || []),
      copyEvent.organizer,
      ...copyEvent.attendees,
    ];

    const matchOriginalMemberWithNewMember = (originalMember: Person, newMember: Person) =>
      originalMember.email === newMember.email;

    const newBookedMembers = newBookingMemberEmails.filter(
      (member) => !originalBookingMemberEmails.some((om) => matchOriginalMemberWithNewMember(om, member))
    );
    const cancelledMembers = originalBookingMemberEmails.filter(
      (member) => !newBookingMemberEmails.some((nm) => matchOriginalMemberWithNewMember(member, nm))
    );
    const rescheduledMembers = newBookingMemberEmails.filter((member) =>
      originalBookingMemberEmails.some((om) => matchOriginalMemberWithNewMember(om, member))
    );

    const reassignedTo = users.find(
      (user) => !user.isFixed && newBookedMembers.some((member) => member.email === user.email)
    );

    const {
      sendRoundRobinRescheduledEmailsAndSMS,
      sendReassignedScheduledEmailsAndSMS,
      sendRoundRobinCancelledEmailsAndSMS,
    } = await import("@calcom/emails/email-manager");

    try {
      await Promise.all([
        sendRoundRobinRescheduledEmailsAndSMS(
          { ...copyEventAdditionalInfo, iCalUID },
          rescheduledMembers,
          metadata
        ),
        sendReassignedScheduledEmailsAndSMS({
          calEvent: copyEventAdditionalInfo,
          members: newBookedMembers,
          eventTypeMetadata: metadata,
        }),
        sendRoundRobinCancelledEmailsAndSMS(
          cancelledRRHostEvt,
          cancelledMembers,
          metadata,
          reassignedTo
            ? {
                name: reassignedTo.name,
                email: reassignedTo.email,
                ...(isRescheduledByBooker && { reason: "Booker Rescheduled" }),
              }
            : undefined
        ),
      ]);
    } catch (err) {
      this.log.error("Failed to send rescheduled round robin event related emails", err);
    }
  }
```

<a id="finding-repository-health-complexity-getandupdatenormalizedvalues-fac5c01648"></a>
## High complexity in getAndUpdateNormalizedValues

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

apps/web/modules/form-builder/components/FormBuilderField.tsx:194 has cyclomatic complexity 13, cognitive complexity 18, and maintainability 41.71.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-getandupdatenormalizedvalues-fac5c01648"></a>
### Autofix

apps/web/modules/form-builder/components/FormBuilderField.tsx L192-L240

Source: apps/web/modules/form-builder/components/FormBuilderField.tsx L192-L240

```typescript
 * Ensures that `labels` and `placeholders`, wherever they are, are set properly. If direct values are not set, default values from fieldTypeConfig are used.
 */
function getAndUpdateNormalizedValues(field: RhfFormFields[number], t: TFunction) {
  let noLabel = false;
  let hidden = !!field.hidden;
  if (field.type === "radioInput") {
    const options = field.options;

    // If we have only one option and it has an input, we don't show the field label because Option name acts as label.
    // e.g. If it's just Attendee Phone Number option then we don't show `Location` label
    if (options?.length === 1) {
      if (!field.optionsInputs) {
        throw new Error("radioInput must have optionsInputs");
      }
      if (field.optionsInputs[options[0].value]) {
        // We don't show the label in this case because the optionInput itself will decide what label to show
        noLabel = true;
      } else {
        // If there's only one option and it doesn't have an input, we don't show the field at all because it's visible in the left side bar
        hidden = true;
      }
    }
  }

  /**
   * Instead of passing labelAsSafeHtml props to all the components, FormBuilder components can assume that the label is safe html and use it on a case by case basis after adding checks here
   */
  if (fieldsThatSupportLabelAsSafeHtml.includes(field.type) && field.labelAsSafeHtml === undefined) {
    throw new Error(`${field.name}:${field.type} type must have labelAsSafeHtml set`);
  }

  const translatedDefaultLabel = t(field.defaultLabel || "");
  const label = field.labelAsSafeHtml || field.label || translatedDefaultLabel;
  const placeholder = field.placeholder || t(field.defaultPlaceholder || "");

  if (field.variantsConfig?.variants) {
    Object.entries(field.variantsConfig.variants).forEach(([variantName, variant]) => {
      variant.fields.forEach((variantField) => {
        const fieldTypeVariantsConfig = fieldTypesConfigMap[field.type]?.variantsConfig;
        const defaultVariantFieldLabel =
          fieldTypeVariantsConfig?.variants?.[variantName]?.fieldsMap[variantField.name]?.defaultLabel;

        variantField.label = variantField.label || t(defaultVariantFieldLabel || "");
      });
    });
  }

  return { hidden, placeholder, label, noLabel, translatedDefaultLabel };
}
```

<a id="finding-repository-health-complexity-createifnotexistsguestactor-8329450e79"></a>
## High complexity in createIfNotExistsGuestActor

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/booking-audit/lib/repository/PrismaAuditActorRepository.ts:26 has cyclomatic complexity 13, cognitive complexity 14, and maintainability 37.26.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-createifnotexistsguestactor-8329450e79"></a>
### Autofix

packages/features/booking-audit/lib/repository/PrismaAuditActorRepository.ts L24-L95

Source: packages/features/booking-audit/lib/repository/PrismaAuditActorRepository.ts L24-L95

```typescript
  }

  async createIfNotExistsGuestActor(params: {
    email: string | null;
    name: string | null;
    phone: string | null;
  }) {
    const { email, name, phone } = params;
    const normalizedEmail = email && email.trim() !== "" ? email : null;
    const normalizedName = name && name.trim() !== "" ? name : null;
    const normalizedPhone = phone && phone.trim() !== "" ? phone : null;

    // If all fields are null, we can't use upsert (no unique constraint), so just create a new record
    if (!normalizedEmail && !normalizedPhone) {
      return this.deps.prismaClient.auditActor.create({
        data: {
          type: "GUEST",
          email: null,
          name: normalizedName,
          phone: null,
        },
      });
    }

    // First try to find by email if email exists
    if (normalizedEmail) {
      const existingByEmail = await this.deps.prismaClient.auditActor.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (existingByEmail) {
        // Update existing record found by email
        return this.deps.prismaClient.auditActor.update({
          where: { email: normalizedEmail },
          data: {
            name: normalizedName ?? undefined,
            phone: normalizedPhone ?? undefined,
          },
        });
      }
    }

    // If not found by email and phone exists, try to find by phone
    if (normalizedPhone) {
      const existingByPhone = await this.deps.prismaClient.auditActor.findUnique({
        where: { phone: normalizedPhone },
        select: { id: true },
      });

      if (existingByPhone) {
        // Update existing record found by phone
        return this.deps.prismaClient.auditActor.update({
          where: { phone: normalizedPhone },
          data: {
            email: normalizedEmail ?? undefined,
            name: normalizedName ?? undefined,
          },
        });
      }
    }

    // Not found by either email or phone, create new record
    return this.deps.prismaClient.auditActor.create({
      data: {
        type: "GUEST",
        email: normalizedEmail,
        name: normalizedName,
        phone: normalizedPhone,
      },
    });
  }
```

<a id="finding-repository-health-complexity-save-8f4b6f6e52"></a>
## High complexity in save

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

apps/api/v2/src/modules/stripe/controllers/stripe.controller.ts:91 has cyclomatic complexity 13, cognitive complexity 14, and maintainability 38.59.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-save-8f4b6f6e52"></a>
### Autofix

apps/api/v2/src/modules/stripe/controllers/stripe.controller.ts L89-L148

Source: apps/api/v2/src/modules/stripe/controllers/stripe.controller.ts L89-L148

```typescript
   * are enforced via controller route guards, avoiding duplication of this logic within the service layer.
   */
  async save(
    @Query("state") state: string,
    @Query("code") code: string,
    @Query("error") error: string | undefined,
    @Query("error_description") error_description: string | undefined
  ): Promise<StripCredentialsSaveOutputResponseDto> {
    if (!state) {
      throw new BadRequestException("Missing `state` query param");
    }

    const decodedCallbackState: OAuthCallbackState = JSON.parse(state);
    try {
      // If teamId is present, proxy to team endpoint
      if (decodedCallbackState.teamId && decodedCallbackState.orgId) {
        let url = "";
        const apiUrl = this.config.get("api.url");
        url = `${apiUrl}/organizations/${decodedCallbackState.orgId}/teams/${decodedCallbackState.teamId}/stripe/save`;

        const params: Record<string, string | undefined> = { state, code, error, error_description };
        const headers = {
          Authorization: `Bearer ${decodedCallbackState.accessToken}`,
        };
        try {
          const response = await this.httpService.axiosRef.get(url, { params, headers });
          const redirectUrl = response.data?.url || decodedCallbackState.onErrorReturnTo || "";
          return { url: redirectUrl };
        } catch (err) {
          const fallbackUrl = decodedCallbackState.onErrorReturnTo || "";
          return { url: fallbackUrl };
        }
      }

      // user-level fallback
      const userId = await this.tokensRepository.getAccessTokenOwnerId(decodedCallbackState.accessToken);

      // user cancels flow
      if (error === "access_denied") {
        return { url: getOnErrorReturnToValueFromQueryState(state) };
      }

      if (error) {
        throw new BadRequestException(stringify({ error, error_description }));
      }

      if (!userId) {
        throw new BadRequestException("Invalid Access token.");
      }

      return await this.stripeService.saveStripeAccount(decodedCallbackState, code, userId);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      return {
        url: decodedCallbackState.onErrorReturnTo ?? "",
      };
    }
  }
```

<a id="finding-repository-health-complexity-getbooking-fd763cf2c0"></a>
## High complexity in getBooking

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/bookings/lib/payment/getBooking.ts:34 has cyclomatic complexity 13, cognitive complexity 13, and maintainability 23.03.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-getbooking-fd763cf2c0"></a>
### Autofix

packages/features/bookings/lib/payment/getBooking.ts L32-L234

Source: packages/features/bookings/lib/payment/getBooking.ts L32-L234

```typescript
  });
}
export async function getBooking(bookingId: number) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    select: {
      ...bookingMinimalSelect,
      responses: true,
      eventType: {
        select: {
          owner: {
            select: {
              hideBranding: true,
            },
          },
          currency: true,
          description: true,
          hosts: {
            select: {
              user: {
                select: {
                  email: true,
                  destinationCalendar: {
                    select: {
                      primaryEmail: true,
                    },
                  },
                },
              },
            },
          },
          id: true,
          length: true,
          price: true,
          requiresConfirmation: true,
          hideOrganizerEmail: true,
          metadata: true,
          customReplyToEmail: true,
          title: true,
          teamId: true,
          parentId: true,
          parent: {
            select: {
              teamId: true,
            },
          },
          slug: true,
          schedulingType: true,
          bookingFields: true,
          team: {
            select: {
              id: true,
              name: true,
              parentId: true,
              hideBranding: true,
              parent: { select: { hideBranding: true } },
            },
          },
          seatsPerTimeSlot: true,
          seatsShowAttendees: true,
          disableCancelling: true,
          disableRescheduling: true,
        },
      },
      metadata: true,
      smsReminderNumber: true,
      location: true,
      eventTypeId: true,
      userId: true,
      uid: true,
      paid: true,
      destinationCalendar: true,
      status: true,
      user: {
        select: {
          id: true,
          username: true,
          timeZone: true,
          credentials: { select: credentialForCalendarServiceSelect },
          timeFormat: true,
          email: true,
          name: true,
          locale: true,
          destinationCalendar: true,
          isPlatformManaged: true,
          hideBranding: true,
          profiles: {
            select: {
              organization: { select: { hideBranding: true } },
            },
          },
        },
      },
    },
  });

  if (!booking) throw new HttpCode({ statusCode: 204, message: "No booking found" });

  type EventTypeRaw = Awaited<ReturnType<typeof getEventType>>;
  let eventTypeRaw: EventTypeRaw | null = null;
  if (booking.eventTypeId) {
    eventTypeRaw = await getEventType(booking.eventTypeId);
  }

  const eventType = { ...eventTypeRaw, metadata: EventTypeMetaDataSchema.parse(eventTypeRaw?.metadata) };

  const { user: userWithoutDelegationCredentials } = booking;

  if (!userWithoutDelegationCredentials) throw new HttpCode({ statusCode: 204, message: "No user found" });
  const user = await enrichUserWithDelegationCredentials({
    user: userWithoutDelegationCredentials,
  });

  const t = await getTranslation(user.locale ?? "en", "common");
  const attendeesListPromises = booking.attendees.map(async (attendee) => {
    return {
      name: attendee.name,
      email: attendee.email,
      timeZone: attendee.timeZone,
      language: {
        translate: await getTranslation(attendee.locale ?? "en", "common"),
        locale: attendee.locale ?? "en",
      },
    };
  });

  const organizerOrganizationProfile = await prisma.profile.findFirst({
    where: {
      userId: booking.userId ?? undefined,
    },
  });

  const organizerOrganizationId = organizerOrganizationProfile?.organizationId;

  const bookerUrl = await getBookerBaseUrl(
    booking.eventType?.team?.parentId ?? organizerOrganizationId ?? null
  );

  const attendeesList = await Promise.all(attendeesListPromises);
  const selectedDestinationCalendar = booking.destinationCalendar || user.destinationCalendar;
  const evt: CalendarEvent = {
    type: booking?.eventType?.slug as string,
    title: booking.title,
    bookerUrl,
    description: booking.description || undefined,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    customInputs: isPrismaObjOrUndefined(booking.customInputs),
    ...getCalEventResponses({
      booking: booking,
      bookingFields: booking.eventType?.bookingFields || null,
    }),
    organizer: {
      email: booking?.userPrimaryEmail ?? user.email,
      name: user.name!,
      username: user.username || undefined,
      usernameInOrg: organizerOrganizationProfile?.username || undefined,
      timeZone: user.timeZone,
      timeFormat: getTimeFormatStringFromUserTimeFormat(user.timeFormat),
      language: { translate: t, locale: user.locale ?? "en" },
      id: user.id,
    },
    hideOrganizerEmail: booking.eventType?.hideOrganizerEmail,
    team: booking.eventType?.team
      ? {
          name: booking.eventType.team.name,
          id: booking.eventType.team.id,
          members: [],
        }
      : undefined,
    attendees: attendeesList,
    location: booking.location,
    uid: booking.uid,
    destinationCalendar: selectedDestinationCalendar ? [selectedDestinationCalendar] : [],
    recurringEvent: parseRecurringEvent(eventType?.recurringEvent),
    customReplyToEmail: booking.eventType?.customReplyToEmail,
    seatsPerTimeSlot: booking.eventType?.seatsPerTimeSlot,
    seatsShowAttendees: booking.eventType?.seatsShowAttendees,
    hideBranding: booking.eventTypeId
      ? await getEventTypeService().shouldHideBrandingForEventType(booking.eventTypeId, {
          team: booking.eventType?.team
            ? { hideBranding: booking.eventType.team.hideBranding, parent: booking.eventType.team.parent }
            : null,
          owner: {
            id: user.id,
            hideBranding: userWithoutDelegationCredentials.hideBranding,
            profiles: userWithoutDelegationCredentials.profiles ?? [],
          },
        } satisfies EventTypeBrandingData)
      : false,
    disableCancelling: booking.eventType?.disableCancelling ?? false,
    disableRescheduling: booking.eventType?.disableRescheduling ?? false,
  };

  return {
    booking,
    user,
    evt,
    eventType,
  };
}
```

<a id="finding-repository-health-complexity-getcalendar-38f85f1def"></a>
## High complexity in getCalendar

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

packages/app-store/_utils/getCalendar.ts:17 has cyclomatic complexity 13, cognitive complexity 13, and maintainability 31.88.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-getcalendar-38f85f1def"></a>
### Autofix

packages/app-store/_utils/getCalendar.ts L15-L121

Source: packages/app-store/_utils/getCalendar.ts L15-L121

```typescript
const log = logger.getSubLogger({ prefix: ["CalendarManager"] });

export const getCalendar = async (
  credential: CredentialForCalendarService | null,
  mode: CalendarFetchMode = "none"
): Promise<Calendar | null> => {
  if (!credential || !credential.key) return null;
  let { type: calendarType } = credential;
  if (calendarType?.endsWith("_other_calendar")) {
    calendarType = calendarType.split("_other_calendar")[0];
  }
  // Backwards compatibility until CRM manager is created
  if (calendarType?.endsWith("_crm")) {
    calendarType = calendarType.split("_crm")[0];
  }

  const calendarAppImportFn =
    CalendarServiceMap[calendarType.split("_").join("") as keyof typeof CalendarServiceMap];

  if (!calendarAppImportFn) {
    log.warn(`calendar of type ${calendarType} is not implemented`);
    return null;
  }

  const calendarApp = await calendarAppImportFn;

  const createCalendarService = calendarApp.default;

  if (!createCalendarService || typeof createCalendarService !== "function") {
    log.warn(`calendar of type ${calendarType} is not implemented`);
    return null;
  }

  // Determine if we should use cache based on mode:
  // - "slots": Check feature flags and use cache when available (for getting actual calendar availability)
  // - "overlay": Don't use cache (for overlay calendar availability)
  // - "booking": Don't use cache (for booking confirmation)
  // - "none": Don't use cache (for operations that don't use getAvailability, e.g., deleteEvent, listCalendars)
  let shouldServeCache = false;
  if (mode === "slots") {
    const featuresRepository = new FeaturesRepository(prisma);
    const [isCalendarSubscriptionCacheEnabled, isCalendarSubscriptionCacheEnabledForUser] = await Promise.all(
      [
        featuresRepository.checkIfFeatureIsEnabledGlobally(
          CalendarSubscriptionService.CALENDAR_SUBSCRIPTION_CACHE_FEATURE
        ),
        featuresRepository.checkIfUserHasFeatureNonHierarchical(
          credential.userId as number,
          CalendarSubscriptionService.CALENDAR_SUBSCRIPTION_CACHE_FEATURE
        ),
      ]
    );
    shouldServeCache = isCalendarSubscriptionCacheEnabled && isCalendarSubscriptionCacheEnabledForUser;
    log.debug("Cache feature flag check", {
      credentialId: credential.id,
      userId: credential.userId,
      mode,
      isCalendarSubscriptionCacheEnabled,
      isCalendarSubscriptionCacheEnabledForUser,
      shouldServeCache,
    });
  } else {
    log.debug("Cache disabled for mode", {
      credentialId: credential.id,
      userId: credential.userId,
      mode,
    });
  }

  const isCacheSupported = CalendarCacheEventService.isCalendarTypeSupported(calendarType);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originalCalendar = createCalendarService(credential as any);

  // Determine if we should use cache
  const useCache = isCacheSupported && shouldServeCache;

  // Build the calendar chain: original -> cache (if enabled) -> telemetry (if enabled)
  let calendar: Calendar = originalCalendar;

  if (useCache) {
    log.debug(`Calendar Cache is enabled, using CalendarCacheWrapper for credential ${credential.id}`);
    const calendarCacheEventRepository = new CalendarCacheEventRepository(prisma);
    calendar = new CalendarCacheWrapper({
      originalCalendar: calendar,
      calendarCacheEventRepository,
    });
  }

  // Wrap ALL calendars with telemetry when telemetry is enabled
  // This provides consistent metrics for all calendar types
  if (isTelemetryEnabled()) {
    log.debug(
      `Using CalendarTelemetryWrapper for credential ${credential.id} (cacheSupported: ${isCacheSupported}, cacheEnabled: ${useCache})`
    );
    calendar = new CalendarTelemetryWrapper({
      originalCalendar: calendar,
      calendarType,
      cacheSupported: isCacheSupported,
      cacheEnabled: useCache,
      credentialId: credential.id,
      mode,
    });
  }

  return calendar;
};
```

<a id="finding-repository-health-complexity-validatereschedulerestrictions-4c1fc46837"></a>
## High complexity in validateRescheduleRestrictions

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

packages/features/bookings/lib/service/RegularBookingService.ts:435 has cyclomatic complexity 13, cognitive complexity 13, and maintainability 42.44.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-validatereschedulerestrictions-4c1fc46837"></a>
### Autofix

packages/features/bookings/lib/service/RegularBookingService.ts L433-L484

Source: packages/features/bookings/lib/service/RegularBookingService.ts L433-L484

```typescript
}

async function validateRescheduleRestrictions({
  rescheduleUid,
  userId,
  eventType,
}: {
  rescheduleUid: string | null | undefined;
  userId: number | null;
  eventType: { seatsPerTimeSlot: number | null; minimumRescheduleNotice: number | null } | null;
}): Promise<void> {
  if (!rescheduleUid || !eventType) {
    return; // Not a reschedule, skip validation
  }

  const bookingSeat = rescheduleUid ? await getSeatedBooking(rescheduleUid) : null;
  const actualRescheduleUid = bookingSeat ? bookingSeat.booking.uid : rescheduleUid;

  if (!actualRescheduleUid) {
    return; // No valid reschedule UID
  }

  try {
    const originalRescheduledBooking = await getOriginalRescheduledBooking(
      actualRescheduleUid,
      !!eventType.seatsPerTimeSlot
    );

    // Check if user is the organizer
    const isUserOrganizer =
      userId && originalRescheduledBooking.userId && userId === originalRescheduledBooking.userId;

    // Check minimum reschedule notice (only for non-organizers)
    const { minimumRescheduleNotice } = originalRescheduledBooking.eventType || {};
    if (
      !isUserOrganizer &&
      isWithinMinimumRescheduleNotice(originalRescheduledBooking.startTime, minimumRescheduleNotice ?? null)
    ) {
      throw new HttpError({
        statusCode: 403,
        message: "Rescheduling is not allowed within the minimum notice period before the event",
      });
    }
  } catch (error) {
    // Re-throw HttpError (including our 403 validation error)
    if (error instanceof HttpError) {
      throw error;
    }
    // For other errors (like booking not found), let the service handle it later
    // We don't want to fail early validation for these cases
  }
}
```

<a id="finding-repository-health-complexity-createbooking-29c643e1fa"></a>
## High complexity in createBooking

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts:112 has cyclomatic complexity 13, cognitive complexity 12, and maintainability 40.92.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-createbooking-29c643e1fa"></a>
### Autofix

apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts L110-L158

Source: apps/api/v2/src/platform/bookings/2024-08-13/services/bookings.service.ts L110-L158

```typescript
  ) {}

  async createBooking(request: Request, body: CreateBookingInput, authUser: AuthOptionalUser) {
    let bookingTeamEventType = false;
    try {
      const eventType = await this.getBookedEventType(body);
      if (eventType?.team) {
        bookingTeamEventType = true;
      }
      if (!eventType) {
        this.errorsBookingsService.handleEventTypeToBeBookedNotFound(body);
      }
      const userIsEventTypeAdminOrOwner = authUser
        ? await this.eventTypeAccessService.userIsEventTypeAdminOrOwner(authUser, eventType)
        : false;
      await this.checkBookingRequiresAuthenticationSetting(eventType, authUser, userIsEventTypeAdminOrOwner);

      if (eventType.schedulingType === "MANAGED") {
        throw new BadRequestException(
          `Event type with id=${eventType.id} is the parent managed event type that can't be booked. You have to provide the child event type id aka id of event type that has been assigned to one of the users.`
        );
      }

      if (eventType.schedulingType === "COLLECTIVE" || eventType.schedulingType === "ROUND_ROBIN") {
        await this.checkEventTypeHasHosts(eventType.id);
      }

      body.eventTypeId = eventType.id;

      const isRecurring = !!eventType?.recurringEvent;
      const isSeated = !!eventType?.seatsPerTimeSlot;

      await this.hasRequiredBookingFieldsResponses(body, eventType);

      if (isRecurring && isSeated) {
        return await this.createRecurringSeatedBooking(request, body, eventType, userIsEventTypeAdminOrOwner);
      }
      if (isRecurring && !isSeated) {
        return await this.createRecurringBooking(request, body, eventType);
      }
      if (isSeated) {
        return await this.createSeatedBooking(request, body, eventType, userIsEventTypeAdminOrOwner);
      }

      return await this.createRegularBooking(request, body, eventType);
    } catch (error) {
      this.errorsBookingsService.handleBookingError(error, bookingTeamEventType);
    }
  }
```

<a id="finding-repository-health-complexity-handleeventtypetobebookednotfound-cc55780172"></a>
## High complexity in handleEventTypeToBeBookedNotFound

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

apps/api/v2/src/platform/bookings/2024-08-13/services/errors.service.ts:10 has cyclomatic complexity 13, cognitive complexity 12, and maintainability 49.75.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-handleeventtypetobebookednotfound-cc55780172"></a>
### Autofix

apps/api/v2/src/platform/bookings/2024-08-13/services/errors.service.ts L8-L32

Source: apps/api/v2/src/platform/bookings/2024-08-13/services/errors.service.ts L8-L32

```typescript
  private readonly logger = new Logger("ErrorsBookingsService_2024_08_13");

  handleEventTypeToBeBookedNotFound(body: CreateBookingInput): never {
    if (body.username && body.eventTypeSlug && !body.organizationSlug) {
      throw new NotFoundException(
        `Event type with slug ${body.eventTypeSlug} belonging to user ${body.username} not found.`
      );
    }
    if (body.username && body.eventTypeSlug && body.organizationSlug) {
      throw new NotFoundException(
        `Event type with slug ${body.eventTypeSlug} belonging to user ${body.username} within organization ${body.organizationSlug} not found.`
      );
    }
    if (body.teamSlug && body.eventTypeSlug && !body.organizationSlug) {
      throw new NotFoundException(
        `Event type with slug ${body.eventTypeSlug} belonging to team ${body.teamSlug} not found.`
      );
    }
    if (body.teamSlug && body.eventTypeSlug && body.organizationSlug) {
      throw new NotFoundException(
        `Event type with slug ${body.eventTypeSlug} belonging to team ${body.teamSlug} within organization ${body.organizationSlug} not found.`
      );
    }
    throw new NotFoundException(`Event type with id ${body.eventTypeId} not found.`);
  }
```

<a id="finding-repository-health-complexity-isalreadybusy-86d18ada30"></a>
## High complexity in isAlreadyBusy

Severity: Warning
Classification: Code health
Language: TypeScript
Framework: Code health

packages/lib/intervalLimits/limitManager.ts:45 has cyclomatic complexity 12, cognitive complexity 17, and maintainability 49.07.

**Criterion:** Repository health complexity policy: warn above cyclomatic 10, cognitive 15, or below maintainability 60.

**Recommended next step:** Split the hotspot into smaller decision units, preserve the current behavior with focused tests, and rerun the health report before applying automated cleanup.

<a id="source-repository-health-complexity-isalreadybusy-86d18ada30"></a>
### Autofix

packages/lib/intervalLimits/limitManager.ts L43-L68

Source: packages/lib/intervalLimits/limitManager.ts L43-L68

```typescript
   * Checks if already marked busy by ancestors or siblings
   */
  isAlreadyBusy(start: Dayjs, unit: IntervalLimitUnit, timeZone?: string) {
    if (this.busyMap.has(LimitManager.createKey(start, "year", timeZone))) return true;

    if (unit === "month" && this.busyMap.has(LimitManager.createKey(start, "month", timeZone))) {
      return true;
    } else if (
      unit === "week" &&
      // weeks can be part of two months
      ((this.busyMap.has(LimitManager.createKey(start, "month", timeZone)) &&
        this.busyMap.has(LimitManager.createKey(start.endOf("week"), "month", timeZone))) ||
        this.busyMap.has(LimitManager.createKey(start, "week", timeZone)))
    ) {
      return true;
    } else if (
      unit === "day" &&
      (this.busyMap.has(LimitManager.createKey(start, "month", timeZone)) ||
        this.busyMap.has(LimitManager.createKey(start, "week", timeZone)) ||
        this.busyMap.has(LimitManager.createKey(start, "day", timeZone)))
    ) {
      return true;
    } else {
      return false;
    }
  }
```

<a id="finding-repository-health-showcase-sampling"></a>
## Showcase sampling: top findings shown

Severity: Info
Classification: Analysis completeness
Language: prisma
Framework: Analysis completeness

This capability showcase surfaces the highest-ranked findings up to a 100-finding cap — showing 100 of 4,380 total findings. Sampled categories: accessibility (50 of 50) and complexity (50 of 359).

**Criterion:** Showcase reports cap generated finding entries at a configurable maximum to stay a usable, committable artifact while reporting the true total.

**Recommended next step:** Run the full Sonde analysis locally, or raise the finding cap, for the complete finding set — this published showcase shows the top findings, not an exhaustive audit.

<a id="source-repository-health-showcase-sampling"></a>
### Source evidence

packages/platform/examples/base/prisma/schema.prisma L15-L26

Source: packages/platform/examples/base/prisma/schema.prisma L15-L26

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  calcomUserId Int? @unique
  calcomUsername String? @unique
  refreshToken String? @unique
  accessToken String? @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now())

}
```

<a id="fix-plan-repository-health"></a>
## Fix plan

Remediation guidance for the findings in this report.

Fix plan link: [Fix plan](../fix-plans/finding-repository-health/index.html#fix-plan-repository-health)

Public export note: this Markdown file is derived from public runtime manifest and search-source data only. Private receipt data and gated fix-plan prose are excluded.
