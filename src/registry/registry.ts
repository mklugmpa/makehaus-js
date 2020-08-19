/*
This file is part of MakeHaus JS, the MakeHaus API for Node.js, released under AGPL-3.0 license.
(c) 2019, 2020 MakeProAudio GmbH and Node.js contributors. All rights reserved.
*/

/*
The core registry
*/
export class Registry {
  private interestPool: InterestPool = new InterestPool();
  private objectPool: ObjectPool = new ObjectPool();

  /*
  Registers a new Interest
  notifies the holder of this Interest of matching objects
  returns the Interest handle
  */
  registerInterest = (objectHandle: string, callback: Function, objectTypes: string, tags: string): string => {
    // create new Interest
    this.log('registerInterest ' + objectHandle + ', ' + objectTypes + ', ' + tags);
    var newInterest = new Interest(objectHandle, callback, objectTypes, tags);
    var interestHandle = this.interestPool.addInterest(newInterest);

    // search for matching objects and call the new Interest back
    var matchingObjects = this.objectPool.getMatchingObjects(objectTypes, tags);
    if (matchingObjects.length > 0) {
      this.log('MATCH FOUND: (registerInterest) - ' + newInterest.holdingObjectHandle + '.callback ' + matchingObjects[0].handle);
      newInterest.callback(CallbackMsg.NEW_MATCH, matchingObjects[0]);
    } else {
      this.log('NO MATCH: (registerInterest) - ' + newInterest.holdingObjectHandle);
      newInterest.callback(CallbackMsg.NO_MATCH, null);
    }
    return interestHandle;
  };

  /*
  Unregisters an Interest
  */
  unRegisterInterest = (interestHandle: string): void => {
    this.log('unRegisterInterest ' + interestHandle);
    this.interestPool.deleteInterest(interestHandle);
  };

  /*
  Registers a new Object
  notifies all holders of Interests that match
  returns the Object handle
  */
  registerObject = (objectReference: object, objectTypes: string, tags: string, hubId: string): string => {
    // create new registered Object
    this.log('registerObject ' + objectReference + ', ' + objectTypes + ', ' + tags + ', ' + hubId);
    var newObject = new RegisteredObject(objectReference, objectTypes, tags, hubId);
    var objectHandle = this.objectPool.addObject(newObject);

    // search for matching Interests and call them back
    this.interestPool.getMatchingInterests(objectTypes, tags).forEach((matchingInterest) => {
      this.log('MATCH FOUND: (registerObject) - ' + matchingInterest.holdingObjectHandle + '.callback ' + newObject.handle);
      matchingInterest.callback(CallbackMsg.NEW_MATCH, newObject);
    });
    return objectHandle;
  };

  /*
  Unregisters an Object identified by its handle
  deletes all Interests held by this Object
  notifies all holder objects of Interests that match
  */
  unRegisterObject = (objectHandle: string): void => {
    this.log('unRegisterObject ' + objectHandle);
    var obj = this.objectPool.getObject(objectHandle);

    // inform all matching interest holders
    this.interestPool.getMatchingInterests(obj.objectTypes, obj.tags).forEach((matchingInterest) => {
      this.log('MATCH LOST: (unRegisterObject) - ' + matchingInterest.holdingObjectHandle + '.callback ' + objectHandle);
      matchingInterest.callback(CallbackMsg.MATCH_LOST, objectHandle);
    });

    // unregister all Interests registered by this Object
    this.interestPool.getHeldInterests(objectHandle).forEach((heldInterest) => {
      this.unRegisterInterest(heldInterest.handle);
    });

    // last step: delete the object from the pool
    this.objectPool.deleteObject(objectHandle);
  };

  log = (msg: string) => {
    console.log('[REGISTRY] ' + msg);
  };
}

/*
Manages all registered Interests
*/
export class InterestPool {
  private interests = new Map();
  private currentInterestHandle: number = 0;

  /*
  adds a new Interest to the pool
  */
  addInterest = (interest: Interest): string => {
    // generate handle for this Interest
    this.currentInterestHandle++;
    var handle = this.currentInterestHandle.toString();
    interest.handle = handle;

    // TODO: Avoid duplicate entries

    // add Interest to map
    this.interests.set(handle, interest);
    return handle;
  };

  /*
  deletes an Interest from the pool
  */
  deleteInterest = (handle: string): void => {
    // delete interest from map
    this.interests.delete(handle);
  };

  /*
  retrieves all Interests that match on passed parameters as an Array
  */
  getMatchingInterests = (objectTypes: string, tags: string): Interest[] => {
    var matchingInterests: Interest[] = [];

    // TO IMPROVE: find matches and add to array
    for (let value of this.interests.values()) {
      if (value.objectTypes == objectTypes) {
        matchingInterests.push(value);
      }
    }
    return matchingInterests;
  };

  /*
  retrieves all Interests that were registered by
  the object identified with the passed obectHandle
  */
  getHeldInterests = (objectHandle: string): Interest[] => {
    var heldInterests: Interest[] = [];

    // retrieve Interests held this object
    for (let value of this.interests.values()) {
      if (value.holdingObjectHandle == objectHandle) {
        heldInterests.push(value);
      }
    }
    return heldInterests;
  };
}

/*
Manages all registered Objects
*/
export class ObjectPool {
  private registeredObjects = new Map();
  private currentObjectHandle: number = 0;

  /*
  adds a new Object to the pool
  */
  addObject = (newObject: RegisteredObject): string => {
    var handle = '';

    // generate handle for this Interest
    this.currentObjectHandle++;
    handle = this.currentObjectHandle.toString();
    newObject.handle = handle;

    // add Object to map
    this.registeredObjects.set(handle, newObject);

    console.log('[ObjectPool] Registered Objects: ' + this.registeredObjects.size);
    //this.logAllObjects();
    return handle;
  };

  /*
  returns all registered Objects from the pool
  */
  getAllObjects = (): Map<any, any> => {
    return this.registeredObjects;
  };

  /*
  retrieves a certain Object from the pool
  */
  getObject = (handle: string): RegisteredObject => {
    return this.registeredObjects.get(handle);
  };

  /*
  deletes an Object from the pool
  */
  deleteObject = (handle: string): void => {
    // delete object from map
    this.registeredObjects.delete(handle);
  };

  /*
  retrieves all Objects that match on passed parameters as an Array
  */
  getMatchingObjects = (objectTypes: string, tags: string): RegisteredObject[] => {
    var matchingObjects: RegisteredObject[] = [];

    // TO IMPROVE: find matches and add to array
    for (let value of this.registeredObjects.values()) {
      if (value.objectTypes == objectTypes) {
        matchingObjects.push(value);
      }
    }
    return matchingObjects;
  };

  // Logging for debugging
  private logAllObjects = () => {
    this.registeredObjects.forEach(this.logMapElements);
  };

  private logMapElements = (value, key, map) => {
    console.log(`m[${key}] = ${value}`);
  };
}

export class Interest {
  handle: string;
  holdingObjectHandle: string;
  callback: Function;
  objectTypes: string;
  tags: string;

  constructor(holdingObjectHandle: string, callback: Function, objectTypes: string, tags: string) {
    this.handle = '';
    this.holdingObjectHandle = holdingObjectHandle;
    this.callback = callback;
    this.objectTypes = objectTypes;
    this.tags = tags;
  }
}

export class RegisteredObject {
  handle: string;
  objectReference: object;
  objectTypes: string;
  tags: string;
  hubId: string;

  constructor(objectReference: object, objectTypes: string, tags: string, hubId: string) {
    this.handle = '';
    this.objectReference = objectReference;
    this.objectTypes = objectTypes;
    this.tags = tags;
    this.hubId = hubId || '';
  }
}

export enum CallbackMsg {
  NEW_MATCH = 'NEW_MATCH',
  NO_MATCH = 'NO_MATCH',
  MATCH_LOST = 'MATCH_LOST',
}

export const registry: Registry = new Registry();
Object.seal(registry);
