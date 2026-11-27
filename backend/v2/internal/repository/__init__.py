from sqlalchemy.orm import Session, aliased
from sqlalchemy import cast, func, select
from typing import List
from geoalchemy2.functions import ST_DistanceSphere,ST_X, ST_Y
from geoalchemy2 import Geometry